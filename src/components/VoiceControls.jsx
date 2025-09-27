import React, { useState, useRef, useEffect } from 'react';

const VoiceControls = ({ onTranscript, isActive, onToggle }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript = event.results[i][0].transcript;
            setTranscript(finalTranscript);
            if (onTranscript) onTranscript(finalTranscript);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  useEffect(() => {
    if (isActive && recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    } else if (!isActive && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isActive, isListening]);

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
      if (onToggle) onToggle();
    }
  };

  return (
    <div className="voice-controls">
      <button
        onClick={toggleListening}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          isListening
            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isListening ? '🎤 Stop Listening' : '🎤 Start Listening'}
      </button>
      {transcript && (
        <p className="mt-2 text-sm text-blue-300 italic">Last: "{transcript}"</p>
      )}
    </div>
  );
};

export default VoiceControls;