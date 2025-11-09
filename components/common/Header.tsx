import Logo from '../icons/Logo';
import Button from '../ui/Button';

export default function UnAuthenticatedHeader({ handleNavigate }: { handleNavigate: () => void }) {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        <nav className="flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900 transition">
            Introduction
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
            Pricing
          </a>
          <a href="#docs" className="text-gray-600 hover:text-gray-900 transition">
            Docs
          </a>
          <Button onClick={handleNavigate} variant="default">
            회원가입 / 로그인
          </Button>
        </nav>
      </div>
    </header>
  );
}
