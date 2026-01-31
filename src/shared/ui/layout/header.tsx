import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/mypage" className="flex items-center gap-2">
          <span className="text-primary text-xl font-bold tracking-tight">JRRA</span>
        </Link>
      </div>
    </header>
  );
}
