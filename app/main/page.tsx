import { Header } from '@/components/common/app/Header';

export default function mainHome() {
  return (
    <>
      <Header />
      <section className="p-6">
        <h1 className="text-2xl font-semibold">메인</h1>
        <p className="text-zinc-600">본문</p>
      </section>
    </>
  );
}