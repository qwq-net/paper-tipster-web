import { RACE_EVENTS, raceEventEmitter } from '@/shared/lib/sse/event-emitter';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    start(controller) {
      console.log(`[SSE] Client connected. Using EventEmitter: ${raceEventEmitter.id}`);

      controller.enqueue(encoder.encode(`data: {"type":"connected","id":"${raceEventEmitter.id}"}\n\n`));

      const onRaceFinalized = (data: { raceId: string }) => {
        console.log(`[SSE] Emitting RACE_FINALIZED for race: ${data.raceId}`);
        const payload = JSON.stringify({ type: 'RACE_FINALIZED', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      const onRaceBroadcast = (data: { raceId: string }) => {
        console.log(`[SSE] Emitting RACE_BROADCAST for race: ${data.raceId}`);
        const payload = JSON.stringify({ type: 'RACE_BROADCAST', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      const onRaceClosed = (data: { raceId: string }) => {
        console.log(`[SSE] Emitting RACE_CLOSED for race: ${data.raceId}`);
        const payload = JSON.stringify({ type: 'RACE_CLOSED', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      const onRaceReopened = (data: { raceId: string }) => {
        console.log(`[SSE] Emitting RACE_REOPENED for race: ${data.raceId}`);
        const payload = JSON.stringify({ type: 'RACE_REOPENED', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      const onRaceOddsUpdated = (data: { raceId: string; data?: Record<string, unknown> }) => {
        console.log(`[SSE] Emitting RACE_ODDS_UPDATED for race: ${data.raceId}`);
        const payload = JSON.stringify({ type: 'RACE_ODDS_UPDATED', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      const onRankingUpdated = (data: { eventId: string; published: boolean; ranking?: unknown[] }) => {
        console.log(`[SSE] Emitting RANKING_UPDATED for event: ${data.eventId}`);
        const payload = JSON.stringify({ type: 'RANKING_UPDATED', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      const onRaceResultUpdated = (data: { raceId: string; results: unknown[] }) => {
        console.log(`[SSE] Emitting RACE_RESULT_UPDATED for race: ${data.raceId}`);
        const payload = JSON.stringify({ type: 'RACE_RESULT_UPDATED', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      raceEventEmitter.on(RACE_EVENTS.RACE_FINALIZED, onRaceFinalized);
      raceEventEmitter.on(RACE_EVENTS.RACE_BROADCAST, onRaceBroadcast);
      raceEventEmitter.on(RACE_EVENTS.RACE_CLOSED, onRaceClosed);
      raceEventEmitter.on(RACE_EVENTS.RACE_REOPENED, onRaceReopened);
      raceEventEmitter.on(RACE_EVENTS.RACE_ODDS_UPDATED, onRaceOddsUpdated);
      raceEventEmitter.on(RACE_EVENTS.RANKING_UPDATED, onRankingUpdated);
      raceEventEmitter.on(RACE_EVENTS.RACE_RESULT_UPDATED, onRaceResultUpdated);

      const heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode('data: : ping\n\n'));
      }, 30000);

      req.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected. Cleaning up listeners for EventEmitter: ${raceEventEmitter.id}`);
        clearInterval(heartbeatInterval);
        raceEventEmitter.off(RACE_EVENTS.RACE_FINALIZED, onRaceFinalized);
        raceEventEmitter.off(RACE_EVENTS.RACE_BROADCAST, onRaceBroadcast);
        raceEventEmitter.off(RACE_EVENTS.RACE_CLOSED, onRaceClosed);
        raceEventEmitter.off(RACE_EVENTS.RACE_REOPENED, onRaceReopened);
        raceEventEmitter.off(RACE_EVENTS.RACE_ODDS_UPDATED, onRaceOddsUpdated);
        raceEventEmitter.off(RACE_EVENTS.RANKING_UPDATED, onRankingUpdated);
        raceEventEmitter.off(RACE_EVENTS.RACE_RESULT_UPDATED, onRaceResultUpdated);
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
