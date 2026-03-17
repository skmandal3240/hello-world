import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(onNewMessage?: (msg: unknown) => void, onPartnerMatched?: (data: unknown) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io('/', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    if (onNewMessage) socket.on('new-message', onNewMessage);
    if (onPartnerMatched) socket.on('partner-matched', onPartnerMatched);

    return () => { socket.disconnect(); };
  }, [onNewMessage, onPartnerMatched]);

  const sendMessage = (content: string) => {
    socketRef.current?.emit('send-message', { content });
  };

  return { sendMessage };
}
