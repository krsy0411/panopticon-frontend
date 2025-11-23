/**
 * 사용자 프로필 드롭다운 컴포넌트
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/src/hooks/useAuth';
import Image from 'next/image';

export const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isAuthenticated || !user) {
    return (
      <button className="hover:text-blue-600 transition">
        <FiUser className="w-7 h-7 text-zinc-700" />
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition"
        aria-label="User menu"
      >
        {user.avatarUrl || user.avatar_url ? (
          <Image
            src={user.avatarUrl || user.avatar_url!}
            alt={user.displayName || user.login || user.email}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {(user.displayName || user.login || user.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <FiChevronDown
          className={`w-4 h-4 text-zinc-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-zinc-200 py-2 z-50">
          {/* 사용자 정보 */}
          <div className="px-4 py-3 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              {user.avatarUrl || user.avatar_url ? (
                <Image
                  src={user.avatarUrl || user.avatar_url!}
                  alt={user.displayName || user.login || user.email}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                  {(user.displayName || user.login || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">
                  {user.displayName || user.login || user.email}
                </p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {user.provider === 'github' ? 'GitHub' : 'Google'}
              </span>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            disabled={isLoggingOut}
            className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 disabled:opacity-50"
          >
            <FiLogOut className="w-4 h-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
};
