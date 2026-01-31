import { cn } from '@/shared/utils/cn';

type BadgeVariant =
  | 'surface' // 芝・ダート
  | 'condition' // 良・稍重・重・不良
  | 'status'; // SCHEDULED, CLOSED, etc.

interface BadgeProps {
  label: string | null;
  variant: BadgeVariant;
  className?: string;
}

export function Badge({ label, variant, className }: BadgeProps) {
  if (!label) return <span>-</span>;

  const getVariantStyles = () => {
    switch (variant) {
      case 'surface':
        return label === '芝' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';

      case 'condition':
        switch (label) {
          case '良':
            return 'bg-sky-100 text-sky-800';
          case '稍重':
            return 'bg-cyan-100 text-cyan-800';
          case '重':
            return 'bg-slate-200 text-slate-800';
          case '不良':
            return 'bg-gray-300 text-gray-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }

      case 'status':
        switch (label) {
          case 'SCHEDULED':
            return 'bg-blue-100 text-blue-800';
          case 'CLOSED':
            return 'bg-yellow-100 text-yellow-800';
          case 'FINALIZED':
            return 'bg-gray-100 text-gray-800';
          default:
            return 'bg-red-100 text-red-800';
        }

      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-black/5 ring-inset',
        getVariantStyles(),
        className
      )}
    >
      {label}
    </span>
  );
}
