import { cn } from '@/shared/utils/cn';

type BadgeVariant = 'surface' | 'condition' | 'status' | 'gender' | 'role' | 'origin' | 'outline';

interface BadgeProps {
  label: string | null;
  variant?: BadgeVariant;
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ label, variant = 'outline', className, children }: BadgeProps) {
  const content = children || label;
  if (!content) return <span>-</span>;

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
          case '受付中':
          case 'Active':
          case '有効':
            return 'bg-green-100 text-green-800';
          case 'ACTIVE':
          case '開催中':
            return 'bg-blue-100 text-blue-800';
          case 'CLOSED':
          case '締切済み':
            return 'bg-orange-100 text-orange-800';
          case 'FINALIZED':
          case '結果確定済み':
            return 'bg-indigo-100 text-indigo-800';
          case 'COMPLETED':
          case '終了':
            return 'bg-gray-100 text-gray-800';
          case 'CANCELLED':
          case 'キャンセル':
          case 'Disabled':
          case '無効':
            return 'bg-red-100 text-red-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }

      case 'gender':
        switch (label) {
          case '牡':
            return 'bg-blue-100 text-blue-800';
          case '牝':
            return 'bg-red-100 text-red-800';
          case 'セ':
          case 'セン':
            return 'bg-gray-200 text-gray-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }

      case 'role':
        switch (label) {
          case 'ADMIN':
            return 'bg-red-100 text-red-800';
          case 'TIPSTER':
          case 'AI_TIPSTER':
            return 'bg-purple-100 text-purple-800';
          case 'GUEST':
            return 'bg-green-100 text-green-800';
          case 'You':
            return 'bg-blue-100 text-blue-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }

      case 'origin':
        switch (label) {
          case 'DOMESTIC':
          case '日本産':
            return 'bg-white text-gray-700 ring-gray-200';
          case 'FOREIGN_BRED':
          case '外国産':
            return 'bg-orange-50 text-orange-700 ring-orange-200';
          case 'FOREIGN_TRAINED':
          case '外来馬':
            return 'bg-purple-50 text-purple-700 ring-purple-200';
          default:
            return 'bg-gray-50 text-gray-600 ring-gray-200';
        }

      case 'outline':
      default:
        return 'bg-white text-gray-700 ring-gray-200';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap ring-1 ring-black/5 ring-inset',
        getVariantStyles(),
        className
      )}
    >
      {content}
    </span>
  );
}
