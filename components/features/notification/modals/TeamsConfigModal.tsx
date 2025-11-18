'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export interface TeamsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TeamsConfig) => void;
}

export interface TeamsConfig {
  webhookUrl: string;
}

export default function TeamsConfigModal({ isOpen, onClose, onSave }: TeamsConfigModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_teams');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.webhookUrl || '';
    } catch {
      return '';
    }
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!webhookUrl) {
      toast.error('웹훅 URL을 입력해주세요.');
      return;
    }

    onSave({ webhookUrl });
    onClose();
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
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
