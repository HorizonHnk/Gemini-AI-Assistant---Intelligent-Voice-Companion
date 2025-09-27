import React, { useState, useRef, useEffect } from 'react';

export function SpeakerControls({ text, isAutoPlay = false, onPlayStateChange, isDarkTheme = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const getThemeClasses = (baseClasses) => {
    if (isDarkTheme) {
      return baseClasses;
    } else {
      // Light theme replacements
      return baseClasses
        .replace(/bg-slate-700/g, 'bg-gray-200')
        .replace(/bg-slate-600/g, 'bg-gray-300')
        .replace(/bg-slate-500/g, 'bg-gray-400')
        .replace(/text-white/g, 'text-gray-900')
        .replace(/text-slate-300/g, 'text-gray-600');
    }
  };

  useEffect(() => {
    loadVoices();
    if (synthRef.current) {
      synthRef.current.addEventListener('voiceschanged', loadVoices);
      return () => {
        synthRef.current.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  useEffect(() => {
    if (isAutoPlay && text && !isPlaying) {
      handlePlay();
    }
  }, [text, isAutoPlay]);

  const loadVoices = () => {
    const availableVoices = synthRef.current.getVoices();
    // Filter to only English voices
    const englishVoices = availableVoices.filter(voice =>
      voice.lang.startsWith('en-')
    );
    setVoices(englishVoices);

    // Set default English voice
    const defaultVoice = englishVoices.find(voice =>
      voice.lang.startsWith('en-US')
    ) || englishVoices[0] || availableVoices[0];

    if (defaultVoice && !selectedVoice) {
      setSelectedVoice(defaultVoice);
    }
  };


  const handlePlay = () => {
    if (!text || !selectedVoice) return;

    if (isPaused && utteranceRef.current) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      onPlayStateChange?.(true);
      return;
    }

    // Stop any current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      onPlayStateChange?.(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onPlayStateChange?.(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onPlayStateChange?.(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handlePause = () => {
    if (isPlaying && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  };

  const handleStop = () => {
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    onPlayStateChange?.(false);
    utteranceRef.current = null;
  };


  return (
    <div className={getThemeClasses("speaker-controls flex items-center gap-2 p-2 bg-slate-700 rounded-lg")}>
      {/* Play/Pause/Stop Controls */}
      <div className="flex items-center gap-1">
        {!isPlaying && !isPaused && (
          <button
            onClick={handlePlay}
            disabled={!text || !selectedVoice}
            className="p-1 text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            title="Play"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {isPlaying && (
          <button
            onClick={handlePause}
            className="p-1 text-yellow-400 hover:text-yellow-300"
            title="Pause"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {isPaused && (
          <button
            onClick={handlePlay}
            className="p-1 text-green-400 hover:text-green-300"
            title="Resume"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="p-1 text-red-400 hover:text-red-300"
            title="Stop"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Voice Selector */}
      <select
        value={voices.indexOf(selectedVoice)}
        onChange={(e) => setSelectedVoice(voices[parseInt(e.target.value)])}
        className={getThemeClasses("text-xs bg-slate-600 text-white rounded px-2 py-1 border-none outline-none max-w-20")}
        title="Select Voice"
      >
        {voices.map((voice, index) => (
          <option key={index} value={index}>
            {voice.name.split(' ')[0]}
          </option>
        ))}
      </select>

      {/* Speed Control */}
      <div className="flex items-center gap-1">
        <span className={getThemeClasses("text-xs text-slate-300")} title="Speech Rate">⚡</span>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speechRate}
          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
          className="w-12 h-1"
          title={`Speed: ${speechRate}x`}
        />
        <span className={getThemeClasses("text-xs text-slate-300 w-6")}>{speechRate}x</span>
      </div>
    </div>
  );
}