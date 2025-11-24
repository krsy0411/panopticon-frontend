'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { createWebhook, testWebhook as testWebhookApi } from '@/src/api/webhook';
import type { WebhookConfig } from '@/src/api/webhook';

export interface TeamsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TeamsConfig) => void;
}

export interface TeamsConfig {
  webhookUrl: string;
  webhookId?: string;
  lastTestResult?: 'success' | 'failure';
  lastTestAt?: string;
}

export default function TeamsConfigModal({ isOpen, onClose, onSave }: TeamsConfigModalProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!webhookUrl) {
      toast.error('웹훅 URL을 입력해주세요.');
      return;
    }

    setIsTesting(true);
    try {
      const config = await createWebhook({
        type: 'teams',
        name: 'Teams Notification',
        webhookUrl,
      });
      setWebhookConfig(config);

      const result = await testWebhookApi(config.id);
      if (result.success) {
        toast.success('테스트 메시지가 전송되었습니다!');
        onSave({
          webhookUrl,
          webhookId: config.id,
          lastTestResult: 'success',
          lastTestAt: new Date().toISOString(),
        });
      } else {
        toast.error(`테스트 실패: ${result.message}`);
      }
    } catch (error) {
      toast.error('테스트 실패: ' + String(error));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!webhookUrl) {
      toast.error('웹훅 URL을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const config = await createWebhook({
        type: 'teams',
        name: 'Teams Notification',
        webhookUrl,
      });
      setWebhookConfig(config);
      onSave({
        webhookUrl,
        webhookId: config.id,
        lastTestResult: webhookConfig?.lastTestedAt ? 'success' : undefined,
        lastTestAt: webhookConfig?.lastTestedAt,
      });
      onClose();
      toast.success('Teams가 성공적으로 연동되었습니다!');
    } catch (error) {
      toast.error('저장 실패: ' + String(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Microsoft Teams 연동 설정</h2>
          <p className="text-sm text-gray-600 mt-1">Teams 웹훅 URL을 입력하세요</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incoming Webhook URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://outlook.office.com/webhook/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 테스트 버튼 */}
          <button
            onClick={handleTest}
            disabled={isTesting || isSaving || !webhookUrl}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? '전송 중...' : '테스트 메시지 전송'}
          </button>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving || isTesting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isTesting || !webhookUrl}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
