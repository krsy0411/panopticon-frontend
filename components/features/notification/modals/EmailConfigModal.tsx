'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { createWebhook, testWebhook as testWebhookApi } from '@/src/api/webhook';
import type { WebhookConfig } from '@/src/api/webhook';

export interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EmailConfig) => void;
}

export interface EmailConfig {
  recipientEmail: string;
  senderName?: string;
  webhookId?: string;
  lastTestResult?: 'success' | 'failure';
  lastTestAt?: string;
}

export default function EmailConfigModal({ isOpen, onClose, onSave }: EmailConfigModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpTls, setSmtpTls] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!recipientEmail) {
      toast.error('수신 이메일 주소를 입력해주세요.');
      return;
    }

    if (!smtpHost || !smtpUser || !smtpPassword) {
      toast.error('SMTP 설정을 완료해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsTesting(true);
    try {
      const config = await createWebhook({
        type: 'email',
        name: 'Email Notification',
        webhookUrl: recipientEmail,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        smtpTls,
      });
      setWebhookConfig(config);

      const result = await testWebhookApi(config.id);
      if (result.success) {
        toast.success('테스트 메시지가 전송되었습니다!');
        onSave({
          recipientEmail,
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
    if (!recipientEmail) {
      toast.error('수신 이메일 주소를 입력해주세요.');
      return;
    }

    if (!smtpHost || !smtpUser || !smtpPassword) {
      toast.error('SMTP 설정을 완료해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const config = await createWebhook({
        type: 'email',
        name: 'Email Notification',
        webhookUrl: recipientEmail,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        smtpTls,
      });
      setWebhookConfig(config);
      onSave({
        recipientEmail,
        webhookId: config.id,
        lastTestResult: webhookConfig?.lastTestedAt ? 'success' : undefined,
        lastTestAt: webhookConfig?.lastTestedAt,
      });
      onClose();
      toast.success('Email이 성공적으로 연동되었습니다!');
    } catch (error) {
      toast.error('저장 실패: ' + String(error));
    } finally {
      setIsSaving(false);
    }
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
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
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
          </div>

          {/* SMTP 설정 */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">SMTP 설정</h3>

            <div className="space-y-3">
              {/* SMTP Host */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP 호스트 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* SMTP Port */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP 포트 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  placeholder="587"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* SMTP User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP 사용자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* SMTP Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP 비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* SMTP TLS */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smtpTls"
                  checked={smtpTls}
                  onChange={(e) => setSmtpTls(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <label htmlFor="smtpTls" className="ml-2 text-sm text-gray-700">
                  TLS 사용
                </label>
              </div>
            </div>
          </div>

          {/* 테스트 버튼 */}
          <button
            onClick={handleTest}
            disabled={isTesting || isSaving || !recipientEmail || !smtpHost}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? '전송 중...' : '테스트 메시지 전송'}
          </button>
        </div>

        {/* 푸터 */}
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
            disabled={isSaving || isTesting || !recipientEmail || !smtpHost}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
