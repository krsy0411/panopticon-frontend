'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

interface DropdownItem {
  href: string;
  label: string;
  ariaLabel: string;
}

interface HeaderDropdownProps {
  triggerIcon: ReactNode;
  triggerLabel: string;
  triggerHref: string;
  title: string;
  items: DropdownItem[];
}

export const HeaderDropdown = ({
  triggerIcon,
  triggerLabel,
  triggerHref,
  title,
  items,
}: HeaderDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  const closeDropdownWithDelay = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 200); // small delay so users can move into the dropdown without it closing
  };

  const handleTriggerClick = () => setIsOpen(false);
  const handleItemClick = () => setIsOpen(false);

  return (
    <div
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={closeDropdownWithDelay}
      onFocusCapture={openDropdown}
      onBlurCapture={closeDropdownWithDelay}
    >
      <Link
        href={triggerHref}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        aria-expanded={isOpen}
        className="block p-2 rounded-md hover:bg-gray-100 cursor-pointer"
        onClick={handleTriggerClick}
      >
        {triggerIcon}
      </Link>

      {/* Dropdown */}
      <div
        className={`absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-150 ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
        }`}
        onMouseEnter={openDropdown}
      >
        {/* 제목 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>

        {/* 메뉴 항목 */}
        <div className="py-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 hover:bg-gray-50 focus:outline-none cursor-pointer transition"
              aria-label={item.ariaLabel}
              onClick={handleItemClick}
            >
              <span className="text-sm text-gray-900">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
