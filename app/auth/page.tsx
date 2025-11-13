'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Logo from '@/components/icons/Logo';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const router = useRouter();

  const handleGithubLogin = () => {
    // TODO: GitHub OAuth 연동
    router.push('/setting/install');
  };

  const handleGoogleLogin = () => {
    // TODO: Google OAuth 연동
    router.push('/setting/insatll');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* 로고 + 제목 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo iconSize="w-14 h-14" textSize="text-3xl" />
          </div>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
        </div>

        {/* 버튼 */}
        <div className="rounded-2xl border shadow-sm p-6 bg-white">
          <div className="space-y-4">
            <Button
              onClick={handleGithubLogin}
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-3"
            >
              {/* GitHub 아이콘 */}
              <FaGithub className="w-5 h-5" />
              Continue with GitHub
            </Button>

            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-3"
            >
              {/* Google 아이콘 */}
              <FcGoogle className="w-5 h-5" />
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
