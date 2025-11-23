'use client';

import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import Dropdown from '@/components/ui/Dropdown';
import type { IntegrationType, SloCreateInput } from '@/src/types/notification';

interface SloCreateModalProps {
  open: boolean;
  defaultMinutes: number;
  onSubmit: (input: SloCreateInput) => void;
  onClose: () => void;
}

const metricDescriptions = {
  availability: {
    title: 'Availability SLO',
    description: '비정상 응답 없이 처리된 요청의 비율입니다.',
  },
  latency: {
    title: 'Latency P95',
    description: '전체 요청 중 가장 느린 5%를 제외한 응답 시간입니다.',
  },
  error_rate: {
    title: 'Error Rate',
    description: '전체 요청 중 오류가 발생한 비율입니다.',
  },
};

const metricOptions = [
  { label: 'Availability', value: 'availability' as const },
  { label: 'Latency (P95)', value: 'latency' as const },
  { label: 'Error Rate', value: 'error_rate' as const },
];

const channelOptions: { label: string; value: IntegrationType }[] = [
  { label: 'Slack', value: 'slack' },
  { label: 'Email', value: 'email' },
  { label: 'Teams', value: 'teams' },
  { label: 'Discord', value: 'discord' },
];

export default function SloCreateModal({
  open,
  defaultMinutes,
  onSubmit,
  onClose,
}: SloCreateModalProps) {
  type SloFormState = {
    id: string;
    name: string;
    metric: SloCreateInput['metric'];
    target: number;
    connectedChannels: IntegrationType[];
    tooltipTitle: string;
    tooltipDescription: string;
  };

  const [form, setForm] = useState<SloFormState>({
    id: crypto.randomUUID(),
    name: 'New SLO',
    metric: 'availability',
    target: 0.99,
    connectedChannels: ['slack'],
    tooltipTitle: metricDescriptions.availability.title,
    tooltipDescription: metricDescriptions.availability.description,
  });

  const [targetError, setTargetError] = useState('');

  useEffect(() => {
    if (open) {
      window.scrollTo({ top: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  if (!open) return null;

  const handleChange = <K extends keyof SloFormState>(key: K, value: SloFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleMetricChange = (metric: SloCreateInput['metric']) => {
    handleChange('metric', metric);
    handleChange('tooltipTitle', metricDescriptions[metric].title);
    handleChange('tooltipDescription', metricDescriptions[metric].description);

    if (metric === 'latency') {
      handleChange('target', 200);
    } else {
      handleChange('target', 0.99);
    }
  };

  const toggleChannel = (channel: IntegrationType) => {
    setForm((prev) => {
      const hasChannel = prev.connectedChannels.includes(channel);
      return {
        ...prev,
        connectedChannels: hasChannel
          ? prev.connectedChannels.filter((c) => c !== channel)
          : [...prev.connectedChannels, channel],
      };
    });
  };

  const handleSubmit = () => {
    onSubmit({
      ...form,
      id: crypto.randomUUID(),
      sliValue: 0,
      actualDowntimeMinutes: 0,
      totalMinutes: defaultMinutes,
    } as SloCreateInput);
  };

  const isLatency = form.metric === 'latency';

  return (
    <div
      className="
        fixed inset-0 z-40 flex items-center justify-center
        bg-black/40 backdrop-blur-sm px-4 pt-25 pb-10
      "
    >
      <div
        className="
          w-full max-w-lg
          max-h-none overflow-visible
          rounded-2xl bg-white shadow-2xl border border-gray-100
          px-7 py-5 animate-fadeIn
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">SLO 생성</h2>
            <p className="text-sm text-gray-500 mt-1">
              목표값과 메트릭 정보를 기반으로 새로운 SLO를 생성합니다.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-gray-400 hover:text-gray-600 transition-colors px-2"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="space-y-6">
          {/* NAME */}
          <div>
            <label className="text-sm font-semibold text-gray-800">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="
                mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all
              "
            />
          </div>

          {/* METRIC */}
          <div>
            <label className="text-sm font-semibold text-gray-800">메트릭</label>
            <Dropdown
              value={form.metric}
              onChange={handleMetricChange}
              options={metricOptions}
              className="mt-2 w-full"
            />
          </div>

          {/* CHANNELS */}
          <div>
            <label className="text-sm font-semibold text-gray-800">연결 채널</label>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {channelOptions.map((channel) => {
                const active = form.connectedChannels.includes(channel.value);

                return (
                  <button
                    key={channel.value}
                    type="button"
                    onClick={() => toggleChannel(channel.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all
                      ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }
                    `}
                  >
                    {channel.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TARGET */}
          <div>
            <label className="text-sm font-semibold text-gray-800">
              목표값 {isLatency ? '(ms, 0~5000)' : '(0 ~ 1)'}
            </label>

            <input
              type="text"
              placeholder="숫자만 입력 가능합니다"
              value={String(form.target)}
              onChange={(e) => {
                const value = e.target.value;

                if (value === '') {
                  setTargetError('');
                  handleChange('target', 0);
                  return;
                }

                if (!/^\d+(\.\d+)?$/.test(value)) {
                  setTargetError('숫자만 입력 가능합니다.');
                  return;
                }

                setTargetError('');
                handleChange('target', isLatency ? Number(value) : parseFloat(value));
              }}
              className="
                mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all
              "
            />

            {targetError && <p className="mt-1 text-xs text-red-500">{targetError}</p>}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700
              hover:bg-gray-50 transition-all
            "
          >
            취소
          </button>

          <button
            onClick={handleSubmit}
            className="
              rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white
              hover:bg-blue-700 shadow-sm transition-all
            "
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
}
