'use client';

import { ConnectionStatus } from '@/shared/hooks/use-sse';
import { cn } from '@/shared/utils/cn';
import { Loader2, WifiOff } from 'lucide-react';

interface LiveConnectionStatusProps {
  status: ConnectionStatus;
  className?: string;
  showText?: boolean;
}

export function LiveConnectionStatus({ status, className, showText = true }: LiveConnectionStatusProps) {
  if (status === 'DISCONNECTED') {
    return (
      <div className={cn('flex items-center gap-2 text-red-500', className)}>
        <WifiOff className="h-4 w-4" />
        {showText && <span className="text-sm font-bold">OFFLINE</span>}
      </div>
    );
  }

  if (status === 'CONNECTING') {
    return (
      <div className={cn('flex items-center gap-2 text-yellow-500', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {showText && <span className="text-sm font-bold">CONNECTING...</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
      </div>
      {showText && <span className="text-sm font-bold text-green-500">LIVE</span>}
    </div>
  );
}
