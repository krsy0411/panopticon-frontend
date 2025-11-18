'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export interface GitHubConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: GitHubConfig) => void;
}

export interface GitHubConfig {
  repository: string;
  accessToken: string;
}

export default function GitHubConfigModal({ isOpen, onClose, onSave }: GitHubConfigModalProps) {
  const [repository, setRepository] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_github');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.repository || '';
    } catch {
      return '';
    }
  });

  const [accessToken, setAccessToken] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_github');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.accessToken || '';
    } catch {
      return '';
    }
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!repository || !accessToken) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    onSave({ repository, accessToken });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">GitHub 연동 설정</h2>
          <p className="text-sm text-gray-600 mt-1">이슈 자동 생성을 위한 설정</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              placeholder="owner/repo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Access Token <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
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
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
