import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

type MatchState = 'idle' | 'queuing' | 'found' | 'ready';

interface MatchInfo {
  sessionId: string;
  partnerDisplayName: string;
}

export function useMatchmaking() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [state, setState] = useState<MatchState>('idle');
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('match:found', (data: MatchInfo) => {
      setState('found');
      setMatchInfo(data);
    });

    socket.on('match:ready', ({ sessionId, roomId }: { sessionId: string; roomId: string }) => {
      setState('ready');
      setRoomId(roomId);
    });

    socket.on('match:partner_declined', () => {
      setState('queuing'); // Re-queue automatically
    });

    return () => {
      socket.off('match:found');
      socket.off('match:ready');
      socket.off('match:partner_declined');
    };
  }, [socket]);

  const joinQueue = useCallback(() => {
    if (!socket || !user?.nativeLanguage || !user?.learningLanguage) return;
    setState('queuing');
    socket.emit('queue:join', {
      learningLanguageId: user.learningLanguage.id,
      nativeLanguageId: user.nativeLanguage.id,
      proficiencyLevel: user.proficiencyLevel,
    });
  }, [socket, user]);

  const leaveQueue = useCallback(() => {
    socket?.emit('queue:leave');
    setState('idle');
    setMatchInfo(null);
  }, [socket]);

  const acceptMatch = useCallback(() => {
    if (!matchInfo) return;
    socket?.emit('match:accept', { sessionId: matchInfo.sessionId });
  }, [socket, matchInfo]);

  const declineMatch = useCallback(() => {
    if (!matchInfo) return;
    socket?.emit('match:decline', { sessionId: matchInfo.sessionId });
    setState('idle');
    setMatchInfo(null);
  }, [socket, matchInfo]);

  return { state, matchInfo, roomId, joinQueue, leaveQueue, acceptMatch, declineMatch };
}
