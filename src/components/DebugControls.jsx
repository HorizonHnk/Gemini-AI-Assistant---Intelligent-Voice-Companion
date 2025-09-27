import React from 'react';

export function DebugControls({
  setAnimationState,
  onSay,
  triggerEyeRoll = () => {},
  triggerWink = () => {},
  isDarkTheme = true,
  audioLevel = 0,
  voiceSensitivity = 0.3,
  onSensitivityChange = () => {},
  pauseThreshold = 1500,
  onPauseThresholdChange = () => {},
  isUserSpeaking = false,
  voiceInterruptionEnabled = true,
  onVoiceInterruptionToggle = () => {},
  noiseFloor = 0.05,
  backgroundNoiseLevel = 0,
  onManualVoiceTest = () => {}
}) {
  const animations = [
    'neutral', 'blink', 'wink', 'smile', 'mouthOpen',
    'talking', 'thinking', 'angry', 'happy', 'offline',
    'curious', 'sad', 'shocked'
  ];

  const getThemeClasses = (baseClasses) => {
    if (isDarkTheme) {
      return baseClasses;
    } else {
      // Light theme replacements
      return baseClasses
        .replace(/bg-slate-600/g, 'bg-gray-300')
        .replace(/bg-slate-500/g, 'bg-gray-400')
        .replace(/text-white/g, 'text-gray-900')
        .replace(/text-slate-300/g, 'text-gray-600')
        .replace(/hover:bg-slate-500/g, 'hover:bg-gray-400')
        .replace(/hover:bg-purple-700/g, 'hover:bg-purple-600')
        .replace(/hover:bg-pink-700/g, 'hover:bg-pink-600')
        .replace(/hover:bg-blue-700/g, 'hover:bg-blue-600')
        .replace(/hover:bg-green-700/g, 'hover:bg-green-600')
        .replace(/hover:bg-yellow-700/g, 'hover:bg-yellow-600');
    }
  };

  return (
    <div className="space-y-1 text-xs overflow-hidden">
      {/* Animation Controls */}
      <div>
        <h4 className={getThemeClasses("text-xs font-medium text-slate-300 mb-1")}>Animations</h4>
        <div className="grid grid-cols-3 gap-1">
          {animations.slice(0, 6).map((animation) => (
            <button
              key={animation}
              onClick={() => setAnimationState(animation)}
              className={getThemeClasses("px-1 py-0.5 text-xs bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors capitalize truncate")}
            >
              {animation}
            </button>
          ))}
        </div>
      </div>

      {/* Eye Controls */}
      <div>
        <h4 className={getThemeClasses("text-xs font-medium text-slate-300 mb-1")}>Eyes</h4>
        <div className="flex gap-1">
          <button
            onClick={triggerEyeRoll}
            className={getThemeClasses("flex-1 px-1 py-0.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors")}
          >
            Roll
          </button>
          <button
            onClick={triggerWink}
            className={getThemeClasses("flex-1 px-1 py-0.5 text-xs bg-pink-600 hover:bg-pink-700 text-white rounded transition-colors")}
          >
            Wink
          </button>
        </div>
      </div>

      {/* Quick Messages */}
      <div>
        <h4 className={getThemeClasses("text-xs font-medium text-slate-300 mb-1")}>Quick Tests</h4>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onSay('Tell me a joke')}
            className={getThemeClasses("px-1 py-0.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors truncate")}
          >
            Joke
          </button>
          <button
            onClick={() => onSay('What can you see?')}
            className={getThemeClasses("px-1 py-0.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors truncate")}
          >
            Vision
          </button>
          <button
            onClick={() => onSay('Hello, how are you?')}
            className={getThemeClasses("px-1 py-0.5 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors truncate")}
          >
            Hello
          </button>
        </div>
      </div>

      {/* Voice Interaction Controls */}
      <div>
        <h4 className={getThemeClasses("text-xs font-medium text-slate-300 mb-1")}>Voice</h4>

        {/* Voice Activation Buttons */}
        <div className="grid grid-cols-2 gap-1 mb-2">
          <button
            onClick={onManualVoiceTest}
            className={getThemeClasses("px-1 py-0.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors truncate")}
          >
            🎤 Test
          </button>
          <button
            onClick={onVoiceInterruptionToggle}
            className={`px-1 py-0.5 text-xs rounded transition-colors truncate ${
              voiceInterruptionEnabled
                ? 'bg-green-600 text-white'
                : getThemeClasses('bg-slate-600 text-slate-300')
            }`}
          >
            {voiceInterruptionEnabled ? '🔊 ON' : '🔇 OFF'}
          </button>
        </div>

        {/* Audio Level Indicator */}
        <div className="mb-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={getThemeClasses("text-slate-300")}>Audio</span>
            <span className={getThemeClasses("text-slate-300")}>{Math.round(audioLevel * 100)}%</span>
          </div>
          <div className={getThemeClasses("w-full bg-slate-600 rounded-full h-1")}>
            <div
              className={`h-1 rounded-full transition-all duration-100 ${
                isUserSpeaking ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Voice Sensitivity */}
        <div className="mb-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={getThemeClasses("text-slate-300")}>Sensitivity</span>
            <span className={getThemeClasses("text-slate-300")}>{Math.round(voiceSensitivity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={voiceSensitivity}
            onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Voice Status */}
        <div className="text-xs text-center">
          <span className={`font-medium ${
            isUserSpeaking ? 'text-green-400' : voiceInterruptionEnabled ? 'text-blue-400' : 'text-gray-400'
          }`}>
            {isUserSpeaking ? '🗣️ Speaking' : voiceInterruptionEnabled ? '👂 Listening' : '🔇 Disabled'}
          </span>
        </div>
      </div>
    </div>
  );
}