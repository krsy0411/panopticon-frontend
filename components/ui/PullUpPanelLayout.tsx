'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

interface PullUpPanelLayoutProps {
  children: ReactNode;
  defaultHeight?: number; // px
  minHeight?: number; // px
  maxHeight?: number; // px
}

export default function PullUpPanelLayout({
  children,
  defaultHeight = 400,
  minHeight = 200,
  maxHeight = 800,
}: PullUpPanelLayoutProps) {
  const [height, setHeight] = useState(defaultHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newHeight = Math.max(minHeight, Math.min(maxHeight, rect.bottom - e.clientY));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minHeight, maxHeight]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 bg-white shadow-lg z-50 flex flex-col overflow-hidden"
      style={{ height: `${height}px`, right: '0px' }}
    >
      {/* 드래그 바 */}
      <div
        className={`h-2 cursor-ns-resize transition-all flex items-center justify-center group ${
          isDragging
            ? 'bg-linear-to-r from-blue-500 via-blue-600 to-blue-500'
            : 'bg-white border-t border-gray-200'
        }`}
        onMouseDown={handleMouseDown}
      ></div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
