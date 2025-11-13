'use client';

import { useEffect, useState } from 'react';
import { IoEyeSharp, IoCubeSharp } from 'react-icons/io5';
import { SiRelay } from 'react-icons/si';
import { PiGraph } from 'react-icons/pi';
import { BiBug } from 'react-icons/bi';
import { HiOutlineDocumentText } from 'react-icons/hi';

const apmItems = [
  { key: 'overview', label: 'Overview', icon: IoEyeSharp },
  { key: 'resources', label: 'Resources', icon: IoCubeSharp },
  { key: 'dependencies', label: 'Dependencies', icon: PiGraph },
  { key: 'traces', label: 'Traces', icon: SiRelay },
  { key: 'errors', label: 'Errors', icon: BiBug },
  { key: 'logs', label: 'Logs', icon: HiOutlineDocumentText },
] as const;

type SectionKey = (typeof apmItems)[number]['key'];
const SECTION_IDS: SectionKey[] = apmItems.map((item) => item.key);

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState<SectionKey>(() => {
    if (typeof window === 'undefined') return 'overview';
    const initialHash = window.location.hash.replace('#', '');
    return SECTION_IDS.find((id) => id === initialHash) ?? 'overview';
  });

  const scrollToSection = (sectionId: SectionKey) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(sectionId);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.filter((entry) => entry.isIntersecting);
        if (!inView.length) return;

        inView.sort((a, b) => {
          const aTop = (a.target as HTMLElement).offsetTop;
          const bTop = (b.target as HTMLElement).offsetTop;
          return aTop - bTop;
        });

        const topMost = inView.find((entry) => entry.boundingClientRect.top <= 160) ?? inView[0];
        const nextId = topMost.target.id;
        const sectionKey = SECTION_IDS.find((id) => id === nextId);

        if (sectionKey && sectionKey !== activeSection) {
          setActiveSection(sectionKey);
        }
      },
      {
        root: null,
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    SECTION_IDS.forEach((sectionId) => {
      const el = document.getElementById(sectionId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeSection]);

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
