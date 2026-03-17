import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Utterance, FeedbackEntry } from '../types/session';

interface UseSessionReturn {
  utterances: Utterance[];
  feedbackMap: Record<string, FeedbackEntry>;
  sessionEnded: boolean;
  endedSummary: { durationSeconds: number } | null;
  partnerDisconnected: boolean;
  submitUtterance: (transcript: string, languageCode: string) => void;
  endSession: (sessionId: string) => void;
}

export function useSession(sessionId: string, userId: string): UseSessionReturn {
  const { socket } = useSocket();
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackEntry>>({});
  const [sessionEnded, setSessionEnded] = useState(false);
  const [endedSummary, setEndedSummary] = useState<{ durationSeconds: number } | null>(null);
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);
  const sequenceRef = useRef(0);

  useEffect(() => {
    if (!socket) return;

    socket.emit('session:join', { sessionId });

    socket.on('utterance:received', (data: Utterance) => {
      setUtterances((prev) => [...prev, data]);
    });

    socket.on('feedback:result', (data: FeedbackEntry) => {
      setFeedbackMap((prev) => ({ ...prev, [data.utteranceId]: data }));
    });

    socket.on('session:ended', (data: { sessionId: string; durationSeconds: number }) => {
      setSessionEnded(true);
      setEndedSummary({ durationSeconds: data.durationSeconds });
    });

    socket.on('partner:disconnected', () => {
      setPartnerDisconnected(true);
    });

    return () => {
      socket.emit('session:leave', { sessionId });
      socket.off('utterance:received');
      socket.off('feedback:result');
      socket.off('session:ended');
      socket.off('partner:disconnected');
    };
  }, [socket, sessionId]);

  const submitUtterance = useCallback(
    (transcript: string, languageCode: string) => {
      if (!socket || !transcript.trim()) return;
      const sequenceNumber = ++sequenceRef.current;

      // Optimistic: add speaker's own utterance immediately
      const optimistic: Utterance = {
        id: `local-${sequenceNumber}`,
        sessionId,
        speakerId: userId,
        transcript,
        languageCode,
        sequenceNumber,
        spokenAt: new Date().toISOString(),
      };
      setUtterances((prev) => [...prev, optimistic]);

      socket.emit('utterance:submit', { sessionId, transcript, languageCode, sequenceNumber });
    },
    [socket, sessionId, userId]
  );

  const endSession = useCallback(
    (sid: string) => {
      socket?.emit('session:end', { sessionId: sid });
    },
    [socket]
  );

  return {
    utterances,
    feedbackMap,
    sessionEnded,
    endedSummary,
    partnerDisconnected,
    submitUtterance,
    endSession,
  };
}
