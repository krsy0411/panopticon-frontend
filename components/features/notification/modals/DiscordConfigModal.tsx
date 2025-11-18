'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
export interface DiscordConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: DiscordConfig) => void;
}

export interface DiscordConfig {
  webhookUrl: string;
  username?: string;
}

export default function DiscordConfigModal({ isOpen, onClose, onSave }: DiscordConfigModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_discord');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.webhookUrl || '';
    } catch {
      return '';
    }
  });

  const [username, setUsername] = useState(() => {
    try {
      if (typeof window === 'undefined') return 'Panopticon';
      const raw = localStorage.getItem('notification_discord');
      if (!raw) return 'Panopticon';
      const parsed = JSON.parse(raw);
      return parsed?.username || 'Panopticon';
    } catch {
      return 'Panopticon';
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
          username: username || 'Panopticon',
          embeds: [
            {
              title: '✅ Discord 연동 테스트 성공!',
              description: 'Panopticon 알림이 성공적으로 설정되었습니다.',
              color: 5814783, // 파란색
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (response.ok || response.status === 204) {
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

    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      toast.error('올바른 Discord 웹훅 URL을 입력해주세요.');
      return;
    }

    onSave({ webhookUrl, username });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Discord 연동 설정</h2>
          <p className="text-sm text-gray-600 mt-1">
            Discord 웹훅 URL을 입력하여 알림을 받아보세요
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              <a
                href="https://discord.com/developers/docs/resources/webhook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                웹훅 생성 방법(Discord 개발자 문서) 보기
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">봇 이름 (선택)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Panopticon"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={isTesting}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isTesting ? '전송 중...' : '테스트 메시지 전송'}
          </button>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
