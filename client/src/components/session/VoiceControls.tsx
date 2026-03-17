import Button from '../ui/Button';

interface VoiceControlsProps {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function VoiceControls({
  isListening,
  isSupported,
  transcript,
  interimTranscript,
  onStart,
  onStop,
  onSubmit,
  disabled,
}: VoiceControlsProps) {
  if (!isSupported) {
    return (
      <div className="text-center text-sm text-red-600 bg-red-50 rounded-lg p-4">
        Your browser doesn't support the Web Speech API. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Interim transcript preview */}
      {(interimTranscript || transcript) && (
        <div className="w-full bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 min-h-[48px]">
          <span className="text-gray-900">{transcript}</span>
          <span className="text-gray-400 italic"> {interimTranscript}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isListening ? (
          <button
            onClick={onStart}
            disabled={disabled}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all
              ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 active:scale-95'}`}
            title="Hold to speak"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V21h2v-2.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg animate-pulse active:scale-95 transition-all"
            title="Stop recording"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        )}

        {transcript && !isListening && (
          <Button onClick={onSubmit} disabled={disabled}>
            Send
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {isListening ? 'Recording… click stop when done' : 'Click the mic to start speaking'}
      </p>
    </div>
  );
}
