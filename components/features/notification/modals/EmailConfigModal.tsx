'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EmailConfig) => void;
}

export interface EmailConfig {
  recipientEmail: string;
  senderName?: string;
}

export default function EmailConfigModal({ isOpen, onClose, onSave }: EmailConfigModalProps) {
  const [recipientEmail, setRecipientEmail] = useState(() => {
    try {
      if (typeof window === 'undefined') return '';
      const raw = localStorage.getItem('notification_email');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.recipientEmail || '';
    } catch {
      return '';
    }
  });

  const [senderName, setSenderName] = useState(() => {
    try {
      if (typeof window === 'undefined') return 'Panopticon Alert';
      const raw = localStorage.getItem('notification_email');
      if (!raw) return 'Panopticon Alert';
      const parsed = JSON.parse(raw);
      return parsed?.senderName || 'Panopticon Alert';
    } catch {
      return 'Panopticon Alert';
    }
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!recipientEmail) {
      toast.error('수신 이메일 주소를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    onSave({ recipientEmail, senderName });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Email 알림 설정</h2>
          <p className="text-sm text-gray-600 mt-1">이메일로 알림을 받을 주소를 설정하세요</p>
        </div>

        {/* 바디 */}
        <div className="p-6 space-y-4">
          {/* 수신 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수신 이메일 주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              SLO 위반 시 이 주소로 알림 이메일이 전송됩니다
            </p>
          </div>

          {/* 발신자 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              발신자 이름 (선택)
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Panopticon Alert"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              💡 이메일 알림은 백엔드 서버를 통해 전송됩니다. 실제 알림을 받으려면 SMTP 설정이
              필요합니다.
            </p>
          </div>
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
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
