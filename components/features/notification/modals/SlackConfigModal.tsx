'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export interface SlackConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SlackConfig) => void;
}

export interface SlackConfig {
  webhookUrl: string;
}

export default function SlackConfigModal({ isOpen, onClose, onSave }: SlackConfigModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_slack');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.webhookUrl || '';
    } catch {
      return '';
    }
  });

  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!webhookUrl) {
      toast.error('웹훅 URL을 입력해주세요.');
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '✅ Slack 연동 테스트 성공!',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Panopticon 알림 테스트*\n슬랙 연동이 성공적으로 완료되었습니다!',
              },
            },
          ],
        }),
      });

      if (response.ok) {
        toast.success('테스트 메시지가 전송되었습니다!');
      } else {
        toast.error('테스트 실패: 웹훅 URL을 확인해주세요.');
      }
    } catch (error) {
      toast.error('테스트 실패: ' + String(error));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!webhookUrl) {
      toast.error('웹훅 URL을 입력해주세요.');
      return;
    }

    if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
      toast.error('올바른 Slack 웹훅 URL을 입력해주세요.');
      return;
    }

    onSave({ webhookUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Slack 연동 설정</h2>
          <p className="text-sm text-gray-600 mt-1">Slack 웹훅 URL을 입력하여 알림을 받아보세요</p>
        </div>

        {/* 바디 */}
        <div className="p-6 space-y-4">
          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline"
              >
                웹훅 URL 생성 방법 보기
              </a>
            </p>
          </div>

          {/* (채널 입력 필드 제거) */}

          {/* 테스트 버튼 */}
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? '전송 중...' : '테스트 메시지 전송'}
          </button>
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
