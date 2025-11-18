'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export interface TrelloConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TrelloConfig) => void;
}

export interface TrelloConfig {
  apiKey: string;
  token: string;
  listId: string;
}

export default function TrelloConfigModal({ isOpen, onClose, onSave }: TrelloConfigModalProps) {
  const [apiKey, setApiKey] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_trello');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.apiKey || '';
    } catch {
      return '';
    }
  });

  const [token, setToken] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_trello');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.token || '';
    } catch {
      return '';
    }
  });

  const [listId, setListId] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_trello');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.listId || '';
    } catch {
      return '';
    }
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey || !token || !listId) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    onSave({ apiKey, token, listId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Trello 연동 설정</h2>
          <p className="text-sm text-gray-600 mt-1">카드 자동 생성을 위한 설정</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              placeholder="List ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
