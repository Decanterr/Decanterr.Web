import { useState, useEffect } from 'react';
import { getConnectionState } from '../services/signalr';
import type { HubConnectionState } from '@microsoft/signalr';

export function useSignalRStatus(): HubConnectionState {
  const [state, setState] = useState<HubConnectionState>(getConnectionState());

  useEffect(() => {
    const interval = setInterval(() => {
      setState(getConnectionState());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
