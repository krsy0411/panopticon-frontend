import Image from 'next/image';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-center">
      <Image
        src="/errorpage/404.png"
        alt="404 고양이"
        width={360}
        height={360}
        priority
        className="w-full max-w-sm mx-auto"
      />
      <h1 className="mt-8 text-2xl font-semibold text-gray-900">찾을 수 없는 페이지예요</h1>
      <p className="mt-2 text-gray-500">
        요청하신 페이지가 존재하지 않거나 이동되었어요. 주소를 다시 확인해 주세요.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center px-6 py-3 rounded-full bg-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
