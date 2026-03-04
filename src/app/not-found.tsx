import { Button } from '@/shared/ui/button';
import { SearchX } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <SearchX className="h-10 w-10 text-blue-600" />
        </div>
        <div className="space-y-2">
          <p className="text-6xl font-bold tracking-tight text-gray-200">404</p>
          <h1 className="text-2xl font-semibold text-gray-900">ページが見つかりません</h1>
          <p className="text-sm text-gray-500">お探しのページは存在しないか、移動した可能性があります。</p>
        </div>
        <Button asChild variant="primary">
          <Link href="/mypage">マイページに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
