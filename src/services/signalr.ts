import * as signalR from '@microsoft/signalr';
import type { QueryClient } from '@tanstack/react-query';
import type { QueueItemDto } from '../api/types';
import { queueKeys } from '../api/hooks/useQueue';
import { bookKeys } from '../api/hooks/useBooks';

export type SignalREvent =
  | { type: 'BookQueued'; data: QueueItemDto }
  | { type: 'ProgressUpdate'; data: QueueItemDto }
  | { type: 'BookCompleted'; data: QueueItemDto }
  | { type: 'BookFailed'; data: QueueItemDto }
  | { type: 'ScanProgress'; data: unknown };

export type SignalREventHandler = (event: SignalREvent) => void;

let connection: signalR.HubConnection | null = null;
const eventHandlers = new Set<SignalREventHandler>();

export function onSignalREvent(handler: SignalREventHandler): () => void {
  eventHandlers.add(handler);
  return () => eventHandlers.delete(handler);
}

function notifyHandlers(event: SignalREvent) {
  eventHandlers.forEach((h) => h(event));
}

export function createSignalRConnection(queryClient: QueryClient): signalR.HubConnection {
  if (connection) return connection;

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const apiKey = import.meta.env.VITE_API_KEY || '';

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${apiUrl}/hubs/progress?api_key=${encodeURIComponent(apiKey)}`, {
      withCredentials: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on('BookQueued', (item: QueueItemDto) => {
    queryClient.invalidateQueries({ queryKey: queueKeys.all });
    queryClient.invalidateQueries({ queryKey: bookKeys.stats });
    notifyHandlers({ type: 'BookQueued', data: item });
  });

  connection.on('ProgressUpdate', (item: QueueItemDto) => {
    queryClient.setQueryData(queueKeys.list(), (old: QueueItemDto[] | undefined) => {
      if (!old) return [item];
      return old.map((q) => (q.asin === item.asin ? item : q));
    });
    notifyHandlers({ type: 'ProgressUpdate', data: item });
  });

  connection.on('BookCompleted', (item: QueueItemDto) => {
    queryClient.invalidateQueries({ queryKey: queueKeys.all });
    queryClient.invalidateQueries({ queryKey: bookKeys.all });
    queryClient.invalidateQueries({ queryKey: bookKeys.stats });
    notifyHandlers({ type: 'BookCompleted', data: item });
  });

  connection.on('BookFailed', (item: QueueItemDto) => {
    queryClient.invalidateQueries({ queryKey: queueKeys.all });
    queryClient.invalidateQueries({ queryKey: bookKeys.stats });
    notifyHandlers({ type: 'BookFailed', data: item });
  });

  connection.on('ScanProgress', (data: unknown) => {
    notifyHandlers({ type: 'ScanProgress', data });
  });

  return connection;
}

export async function startSignalR(): Promise<void> {
  if (!connection) return;
  try {
    await connection.start();
    console.log('SignalR connected');
  } catch (err) {
    console.error('SignalR connection failed:', err);
  }
}

export async function stopSignalR(): Promise<void> {
  if (!connection) return;
  await connection.stop();
  connection = null;
}

export function getConnectionState(): signalR.HubConnectionState {
  return connection?.state ?? signalR.HubConnectionState.Disconnected;
}
