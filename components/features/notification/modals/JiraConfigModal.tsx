'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export interface JiraConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: JiraConfig) => void;
}

export interface JiraConfig {
  siteUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export default function JiraConfigModal({ isOpen, onClose, onSave }: JiraConfigModalProps) {
  const [siteUrl, setSiteUrl] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_jira');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.siteUrl || '';
    } catch {
      return '';
    }
  });

  const [email, setEmail] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_jira');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.email || '';
    } catch {
      return '';
    }
  });

  const [apiToken, setApiToken] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_jira');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.apiToken || '';
    } catch {
      return '';
    }
  });

  const [projectKey, setProjectKey] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_jira');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.projectKey || '';
    } catch {
      return '';
    }
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!siteUrl || !email || !apiToken || !projectKey) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    onSave({ siteUrl, email, apiToken, projectKey });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Jira 연동 설정</h2>
          <p className="text-sm text-gray-600 mt-1">티켓 자동 생성을 위한 설정</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jira Site URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://your-domain.atlassian.net"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Token <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="API Token"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
              placeholder="PROJ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
