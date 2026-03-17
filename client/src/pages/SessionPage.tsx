import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../hooks/useSession';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import TranscriptPanel from '../components/session/TranscriptPanel';
import VoiceControls from '../components/session/VoiceControls';
import FeedbackPanel from '../components/session/FeedbackPanel';
import SessionTimer from '../components/session/SessionTimer';
import Button from '../components/ui/Button';

export default function SessionPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionStart] = useState(new Date());
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const {
    utterances,
    feedbackMap,
    sessionEnded,
    endedSummary,
    partnerDisconnected,
    submitUtterance,
    endSession,
  } = useSession(sessionId!, user?.id || '');

  const langCode = user?.learningLanguage?.code || 'en';
  const { isListening, transcript, interimTranscript, isSupported, start, stop, reset } =
    useSpeechRecognition(langCode);

  const handleSubmit = () => {
    if (transcript.trim()) {
      submitUtterance(transcript, langCode);
      reset();
    }
  };

  const handleEnd = () => {
    endSession(sessionId!);
  };

  if (sessionEnded && endedSummary) {
    const mins = Math.floor(endedSummary.durationSeconds / 60);
    const secs = endedSummary.durationSeconds % 60;
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Session complete!</h1>
        <p className="text-gray-500 mb-2">
          Duration: {mins}m {secs}s
        </p>
        <p className="text-gray-500 mb-8">Great practice! Check your feedback below.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate(`/history/${sessionId}`)}>View corrections</Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {user?.learningLanguage?.flagEmoji} {user?.learningLanguage?.name} Session
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <SessionTimer startedAt={sessionStart} />
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={() => setShowEndConfirm(true)}>
          End session
        </Button>
      </div>

      {partnerDisconnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700 mb-4">
          Your partner disconnected. You can end the session.
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Transcript + Voice */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex-1">
            <TranscriptPanel utterances={utterances} currentUserId={user?.id || ''} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <VoiceControls
              isListening={isListening}
              isSupported={isSupported}
              transcript={transcript}
              interimTranscript={interimTranscript}
              onStart={start}
              onStop={stop}
              onSubmit={handleSubmit}
              disabled={sessionEnded}
            />
          </div>
        </div>

        {/* Right: AI Feedback */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 overflow-y-auto max-h-[600px]">
          <FeedbackPanel
            utterances={utterances}
            feedbackMap={feedbackMap}
            currentUserId={user?.id || ''}
          />
        </div>
      </div>

      {/* End session modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">End session?</h2>
            <p className="text-gray-500 text-sm mb-6">This will end the session for both you and your partner.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="danger" onClick={handleEnd}>End session</Button>
              <Button variant="secondary" onClick={() => setShowEndConfirm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
