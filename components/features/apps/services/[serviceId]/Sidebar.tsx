'use client';

import { useEffect, useState } from 'react';
import { IoEyeSharp, IoCubeSharp } from 'react-icons/io5';
import { SiRelay } from 'react-icons/si';
import { BiBug } from 'react-icons/bi';

const apmItems = [
  { key: 'overview', label: '개요', icon: IoEyeSharp },
  { key: 'resources', label: '리소스', icon: IoCubeSharp },
  { key: 'traces', label: '요청 추적', icon: SiRelay },
  { key: 'errors-logs', label: '에러 로그', icon: BiBug },
] as const;

type SectionKey = (typeof apmItems)[number]['key'];
const SECTION_IDS: SectionKey[] = apmItems.map((item) => item.key);

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');

  const scrollToSection = (sectionId: SectionKey) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(sectionId);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleSections.length > 0) {
          const id = visibleSections[0].target.id as SectionKey;
          if (SECTION_IDS.includes(id)) {
            setActiveSection(id);
          }
        }
      },
      {
        root: null,
        threshold: 0.25, // 25% 이상 보이면 active
      },
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="w-56 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm h-fit sticky top-6">
      <nav className="p-3">
        <div className="flex flex-col gap-1">
          {apmItems.map(({ key, label, icon: Icon }) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => scrollToSection(key)}
                className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm transition ${
                  active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
