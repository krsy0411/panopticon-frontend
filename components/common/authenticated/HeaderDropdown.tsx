'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';

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

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);
  const handleTriggerClick = () => setIsOpen(false);
  const handleItemClick = () => setIsOpen(false);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleMouseEnter}
      onBlurCapture={handleMouseLeave}
    >
      <Link
        href={triggerHref}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        aria-expanded={isOpen}
        className="block p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        onClick={handleTriggerClick}
      >
        {triggerIcon}
      </Link>

      {/* Dropdown */}
      <div
        className={`absolute right-0 top-full w-56 bg-white border rounded shadow-lg transition-all duration-150 ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
        }`}
      >
        {/* 제목 */}
        <div className="flex justify-start items-center px-4 pt-3 pb-2">
          <h3 className="font-semibold text-zinc-900 text-xl">{title}</h3>
        </div>

        {/* 메뉴 항목 */}
        <div className="pt-0 pb-2 px-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-2 rounded hover:bg-gray-100 focus:outline-none cursor-pointer"
              aria-label={item.ariaLabel}
              onClick={handleItemClick}
            >
              <span className="text-sm text-zinc-800">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
