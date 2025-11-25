'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-center">
      <Image
        src="/errorpage/500.png"
        alt="500 고양이"
        width={360}
        height={360}
        priority
        className="w-full max-w-sm mx-auto"
      />
      <h1 className="mt-8 text-2xl font-semibold text-gray-900">예상치 못한 오류가 발생했어요</h1>
      <p className="mt-2 text-gray-500">
        문제가 계속되면 관리자에게 문의해 주세요. 잠시 후 다시 시도할 수 있어요.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-indigo-600 px-6 py-3 text-white text-sm font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-colors"
        >
          다시 시도하기
        </button>
        <Link
          href="/"
          className="rounded-full border border-indigo-200 px-6 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          홈으로 이동
        </Link>
      </div>
    </main>
  );
}
