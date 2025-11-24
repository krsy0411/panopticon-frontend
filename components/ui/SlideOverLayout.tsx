'use client';

import React, { useEffect, useRef } from 'react';
import { useOverlayStack } from './OverlayStackContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // Tailwind width class, e.g. 'w-[80%]' or 'md:w-[600px] w-full'
  widthClass?: string;
  children?: React.ReactNode;
  backdropClassName?: string;
  panelClassName?: string;
  // ESC 키로 닫히는 동작을 활성화할지 여부 (기본: true)
  enableEsc?: boolean;
}

export default function SlideOverLayout({
  isOpen,
  onClose,
  widthClass = 'w-[80%]',
  children,
  backdropClassName = 'fixed inset-0 min-h-screen bg-black/10 backdrop-blur-[2px] z-40 transition-opacity duration-300 opacity-100',
  panelClassName = 'fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0',
  enableEsc = true,
}: Props) {
  const overlayStack = useOverlayStack();
  const idRef = useRef<string | null>(null);

  // Register/unregister with overlay stack when opened/closed.
  useEffect(() => {
    const id =
      idRef.current ??
      `overlay-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    idRef.current = id;

    if (isOpen && enableEsc) {
      if (overlayStack && overlayStack.register) {
        overlayStack.register(id, onClose);
        return () => overlayStack.unregister(id);
      }

      // Fallback: if no overlayStack provider, keep per-instance ESC handling
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }

    // if not open, ensure unregistered
    if (overlayStack) overlayStack.unregister(id);
    return;
  }, [isOpen, enableEsc, overlayStack, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={backdropClassName} style={{ bottom: '0px' }} onClick={onClose} />
      <div className={`${panelClassName} ${widthClass}`}>{children}</div>
    </>
  );
}
