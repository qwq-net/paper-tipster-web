import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { cn } from '@/shared/utils/cn';

interface HistoryLog {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
}

interface HistoryListProps {
  logs: HistoryLog[];
}

export function HistoryList({ logs }: HistoryListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日時</TableHead>
            <TableHead>内容</TableHead>
            <TableHead className="text-right">金額</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                履歴がありません
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm whitespace-nowrap">{log.date}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell className={cn('text-right font-mono', log.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                  {log.amount > 0 ? '+' : ''}
                  {log.amount.toLocaleString('ja-JP')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
