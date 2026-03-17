import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

export default function MatchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, matchInfo, joinQueue, leaveQueue, acceptMatch, declineMatch } = useMatchmaking();

  useEffect(() => {
    if (state === 'ready' && matchInfo) {
      navigate(`/session/${matchInfo.sessionId}`);
    }
  }, [state, matchInfo, navigate]);

  if (!user?.learningLanguage || !user?.nativeLanguage) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Complete onboarding first to find a partner.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-16">
      {state === 'idle' && (
        <>
          <div className="text-6xl mb-4">🌍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find a Language Partner</h1>
          <p className="text-gray-500 mb-8">
            You'll be matched with a native {user.learningLanguage.name} speaker learning{' '}
            {user.nativeLanguage.name}.
          </p>
          <Button onClick={joinQueue} size="lg">Find a partner</Button>
        </>
      )}

      {state === 'queuing' && (
        <>
          <Spinner size="lg" />
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Finding your partner…</h2>
          <p className="text-gray-500 mb-8">This may take a moment. Hang tight!</p>
          <Button variant="secondary" onClick={leaveQueue}>Cancel</Button>
        </>
      )}

      {state === 'found' && matchInfo && (
        <>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Partner found!</h2>
          <p className="text-gray-500 mb-8">
            Ready to start your session with <strong>{matchInfo.partnerDisplayName}</strong>?
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={acceptMatch} size="lg">Accept</Button>
            <Button variant="secondary" onClick={declineMatch} size="lg">Decline</Button>
          </div>
        </>
      )}
    </div>
  );
}
