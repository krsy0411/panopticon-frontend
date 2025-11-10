'use client';

import Link from 'next/link';
import Logo from '../icons/Logo';
import Button from '../ui/Button';

export default function UnAuthenticatedHeader({ handleNavigate }: { handleNavigate: () => void }) {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="flex items-center px-6 py-4">
        <div className="shrink-0">
          <Logo />
        </div>

        <nav className="ml-auto flex items-center gap-8 text-zinc-700">
          <Link href="#introduction" className="hover:text-zinc-900 transition">
            소개
          </Link>
          <Link href="#pricing" className="hover:text-zinc-900 transition">
            가격
          </Link>
          <Link href="#docs" className="hover:text-zinc-900 transition">
            문서
          </Link>

          <Button
            onClick={handleNavigate}
            variant="default"
            className="ml-4 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition"
          >
            회원가입 / 로그인
          </Button>
        </nav>
      </div>
    </header>
  );
}
