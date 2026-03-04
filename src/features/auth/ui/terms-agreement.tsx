import Link from 'next/link';

export function TermsAgreement({ className }: { className?: string }) {
  return (
    <p className={`text-center text-sm text-gray-500 ${className ?? ''}`}>
      利用することで
      <Link href="/terms" className="text-primary hover:underline">
        利用規約
      </Link>
      および
      <Link href="/privacy" className="text-primary hover:underline">
        プライバシーポリシー
      </Link>
      に同意したものとみなされます。
    </p>
  );
}
