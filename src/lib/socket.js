import { io } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { API_URL } from '../api/client';

let socket = null;
let currentToken = null;

export function getSocket() {
  const token = localStorage.getItem('token');
  if (socket && currentToken === token) return socket;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(API_URL, {
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}

export function useSocketEvent(event, handler, deps = []) {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    const s = getSocket();
    const fn = (...args) => handlerRef.current?.(...args);
    s.on(event, fn);
    return () => s.off(event, fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}

export function useMatchSubscription(matchId) {
  useEffect(() => {
    if (!matchId) return;
    const s = getSocket();
    const subscribe = () => s.emit('match:subscribe', matchId);
    subscribe();
    s.on('connect', subscribe);
    return () => {
      s.emit('match:unsubscribe', matchId);
      s.off('connect', subscribe);
    };
  }, [matchId]);
}
