/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiXMark } from 'react-icons/hi2';
import Dropdown from '@/components/ui/Dropdown';
import { getServices } from '@/src/api/apm';
import type { IntegrationType, SloCreateInput, TimeRangeKey } from '@/src/types/notification';

interface SloCreateModalProps {
  open: boolean;
  defaultMinutes: number;
  onSubmit: (input: SloCreateInput) => void;
  onClose: () => void;
  editingData?: SloCreateInput | null;
}

const presetTimeRanges: { label: string; value: TimeRangeKey; minutes: number }[] = [
  { label: '1시간', value: '1h', minutes: 60 },
  { label: '24시간', value: '24h', minutes: 60 * 24 },
  { label: '7일', value: '7d', minutes: 60 * 24 * 7 },
  { label: '30일', value: '30d', minutes: 60 * 24 * 30 },
];

const timeUnitOptions = [
  { label: '시간', value: 'hour' as const },
  { label: '일', value: 'day' as const },
  { label: '주', value: 'week' as const },
];

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
  editingData,
}: SloCreateModalProps) {
  type SloFormState = {
    id: string;
    serviceName: string;
    name: string;
    description?: string;
    metric: SloCreateInput['metric'];
    target: number;
    timeRangeKey: TimeRangeKey;
    connectedChannels: IntegrationType[];
    customValue?: number;
    customUnit?: 'hour' | 'day' | 'week';
  };

  const getInitialForm = useCallback((): SloFormState => {
    if (editingData) {
      return {
        id: editingData.id,
        serviceName: editingData.serviceName || '',
        name: editingData.name,
        description: editingData.description,
        metric: editingData.metric,
        target: editingData.target,
        timeRangeKey: editingData.timeRangeKey || '24h',
        connectedChannels: editingData.connectedChannels,
      };
    }
    return {
      id: '', // 서버가 생성할 임시 빈 값
      serviceName: '',
      name: 'New SLO',
      description: '',
      metric: 'availability',
      target: 0.99,
      timeRangeKey: '24h',
      connectedChannels: ['slack'],
    };
  }, [editingData]);

  const [form, setForm] = useState<SloFormState>(() => getInitialForm());
  const [targetInput, setTargetInput] = useState(String(getInitialForm().target));
  const [targetError, setTargetError] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customValue, setCustomValue] = useState<string>('');
  const [customUnit, setCustomUnit] = useState<'hour' | 'day' | 'week'>('day');
  const isEditMode = !!editingData;

  // 시간 범위 생성
  const timeRange = useMemo(() => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return {
      from: twoWeeksAgo.toISOString(),
      to: now.toISOString(),
    };
  }, []);

  // 서비스 목록 조회
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', timeRange],
    queryFn: () => getServices(timeRange),
    enabled: open, // 모달이 열릴 때만 쿼리 실행
  });

  const serviceOptions =
    servicesData?.services.map((service) => ({
      label: service.service_name,
      value: service.service_name,
    })) || [];

  // editingData가 변경될 때 form과 targetInput을 초기화
  useEffect(() => {
    const initialForm = getInitialForm();
    setForm(initialForm);
    setTargetInput(String(initialForm.target));
    setTargetError('');
  }, [editingData, getInitialForm]);

  // 모달 열릴 때: DOM 업데이트만 (scroll, overflow)
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
    // 목표값 검증
    if (targetInput === '' || targetInput === '.') {
      setTargetError('목표값을 입력해주세요.');
      return;
    }

    const numValue = form.metric === 'latency' ? Number(targetInput) : parseFloat(targetInput);

    // Latency 검증 (0 이상)
    if (form.metric === 'latency') {
      if (numValue < 0) {
        setTargetError('0 이상의 값을 입력하세요.');
        return;
      }
    } else {
      // Availability, Error Rate 검증 (0~1)
      if (numValue < 0 || numValue > 1) {
        setTargetError('0 ~ 1 사이의 값을 입력하세요.');
        return;
      }
    }

    let totalMinutes = defaultMinutes;
    const selectedTimeRangeKey: TimeRangeKey = form.timeRangeKey;

    if (useCustomRange) {
      // 커스텀 기간 검증
      if (!customValue || isNaN(Number(customValue)) || Number(customValue) <= 0) {
        setTargetError('유효한 기간을 입력하세요.');
        return;
      }

      const unitMultipliers = { hour: 60, day: 60 * 24, week: 60 * 24 * 7 };
      totalMinutes = Number(customValue) * unitMultipliers[customUnit];
    } else {
      // 사전설정된 기간 사용
      const selectedTimeRange = presetTimeRanges.find((t) => t.value === form.timeRangeKey);
      totalMinutes = selectedTimeRange?.minutes || defaultMinutes;
    }

    onSubmit({
      ...form,
      target: numValue,
      id: isEditMode ? form.id : crypto.randomUUID(),
      sliValue: isEditMode ? editingData?.sliValue ?? 0 : 0,
      actualDowntimeMinutes: isEditMode ? editingData?.actualDowntimeMinutes ?? 0 : 0,
      totalMinutes,
      timeRangeKey: selectedTimeRangeKey,
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
          max-h-[85vh] overflow-y-auto
          rounded-2xl bg-white shadow-2xl border border-gray-100
          px-7 py-5 animate-fadeIn
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEditMode ? 'SLO 수정' : 'SLO 생성'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode
                ? '기존 SLO의 정보를 수정합니다.'
                : '목표값과 메트릭 정보를 기반으로 새로운 SLO를 생성합니다.'}
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
          {/* SERVICE */}
          <div>
            <label className="text-sm font-semibold text-gray-800">서비스</label>
            {servicesLoading ? (
              <div className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500">
                서비스 목록 로딩 중...
              </div>
            ) : (
              <Dropdown
                value={form.serviceName}
                onChange={(value: string) => handleChange('serviceName', value)}
                options={serviceOptions}
                className="mt-2 w-full"
              />
            )}
            {!servicesLoading && serviceOptions.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">사용 가능한 서비스가 없습니다.</p>
            )}
          </div>

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

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-semibold text-gray-800">설명</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="이 SLO에 대한 설명을 입력하세요"
              rows={3}
              className="
                mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all
              "
            />
          </div>

          {/* METRIC */}
          <div>
            <label className="text-sm font-semibold text-gray-800">모니터링 요소</label>
            <Dropdown
              value={form.metric}
              onChange={handleMetricChange}
              options={metricOptions}
              className="mt-2 w-full"
            />
          </div>

          {/* TIME RANGE / WINDOW */}
          <div>
            <label className="text-sm font-semibold text-gray-800">모니터링 기간</label>

            {/* 탭: 사전설정 / 커스텀 */}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setUseCustomRange(false);
                  setTargetError('');
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  !useCustomRange
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                사전설정
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseCustomRange(true);
                  setTargetError('');
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  useCustomRange
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                커스텀
              </button>
            </div>

            {/* 사전설정 옵션 */}
            {!useCustomRange && (
              <div className="mt-3">
                <Dropdown
                  value={form.timeRangeKey}
                  onChange={(value: TimeRangeKey) => handleChange('timeRangeKey', value)}
                  options={presetTimeRanges.map((t) => ({ label: t.label, value: t.value }))}
                  className="w-full"
                />
              </div>
            )}

            {/* 커스텀 옵션 */}
            {useCustomRange && (
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="예: 3"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <div className="w-24">
                  <Dropdown
                    value={customUnit}
                    onChange={(value: 'hour' | 'day' | 'week') => setCustomUnit(value)}
                    options={timeUnitOptions.map((unit) => ({
                      label: unit.label,
                      value: unit.value,
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              {useCustomRange
                ? '원하는 기간을 입력하세요.'
                : '이 SLO를 평가할 시간 범위를 선택하세요.'}
            </p>
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
              목표값 {isLatency ? '(ms, 0 이상)' : '(0 ~ 1)'}
            </label>

            <input
              type="text"
              placeholder="숫자만 입력 가능합니다"
              value={targetInput}
              onChange={(e) => {
                const value = e.target.value;

                if (value === '') {
                  setTargetInput('');
                  return;
                }

                // 형식 체크만 (숫자/소수점만 허용)
                if (!/^\d*\.?\d*$/.test(value)) {
                  return;
                }

                setTargetInput(value);
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
            {isEditMode ? '수정' : '생성'}
          </button>
        </div>
      </div>
    </div>
  );
}
