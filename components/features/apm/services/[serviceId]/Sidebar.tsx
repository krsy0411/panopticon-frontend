'use client';
import { useState, useEffect } from 'react';
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

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = apmItems.map((item) => item.key);
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 실행

    return () => window.removeEventListener('scroll', handleScroll);
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
