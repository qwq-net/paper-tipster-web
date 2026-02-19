import type { RaceStatusSSEMessage } from '@/shared/lib/sse/types';
import { useEffect, useState } from 'react';

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';

export type SSEMessage = RaceStatusSSEMessage;

interface UseSSEProps {
  url: string;
  onMessage?: (data: SSEMessage) => void;
  disabled?: boolean;
}

export function useSSE({ url, onMessage, disabled = false }: UseSSEProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(disabled ? 'DISCONNECTED' : 'CONNECTING');

  useEffect(() => {
    if (disabled) return;

    let eventSource: EventSource | null = null;
    let heartbeatTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      setConnectionStatus('CONNECTING');
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setConnectionStatus('CONNECTED');

        resetHeartbeat();
      };

      eventSource.onmessage = (event) => {
        if (event.data === ': ping') {
          resetHeartbeat();
          return;
        }

        try {
          const data: SSEMessage = JSON.parse(event.data);
          if (data.type === 'connected') return;

          onMessage?.(data);
        } catch (error) {
          console.error('[SSE] Parse Error', error);
        }
      };

      eventSource.onerror = (err) => {
        console.error('[SSE] Error', err);
        setConnectionStatus('DISCONNECTED');
        eventSource?.close();
        clearTimeout(heartbeatTimeout);
        setTimeout(connectSSE, 5000);
      };
    };

    const resetHeartbeat = () => {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = setTimeout(() => {
        console.warn('[SSE] Heartbeat timeout');
        setConnectionStatus('DISCONNECTED');
        eventSource?.close();
        connectSSE();
      }, 40000);
    };

    connectSSE();

    return () => {
      eventSource?.close();
      clearTimeout(heartbeatTimeout);
      setConnectionStatus('DISCONNECTED');
    };
  }, [url, disabled, onMessage]);

  return { connectionStatus };
}
