import React from 'react';

export function ControlBar({ isCameraOn, isListening, toggleCamera, toggleListening, endCall, onSwitchCamera, availableCameras = [], isDarkTheme = true }) {
  const getThemeClasses = (baseClasses) => {
    if (isDarkTheme) {
      return baseClasses;
    } else {
      // Light theme replacements
      return baseClasses
        .replace(/bg-slate-800\/80/g, 'bg-gray-100/80')
        .replace(/bg-slate-600/g, 'bg-gray-300')
        .replace(/border-slate-600/g, 'border-gray-300')
        .replace(/text-white/g, 'text-gray-900');
    }
  };
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-4 z-30">
      <div className={getThemeClasses("flex items-center justify-center gap-3 rounded-full bg-slate-800/80 backdrop-blur-sm p-3 border border-slate-600")}>
        {/* Microphone Button */}
        <button
          onClick={toggleListening}
          disabled={!isCameraOn}
          className={`rounded-full w-12 h-12 flex items-center justify-center ${getThemeClasses('text-white')} font-medium transition-all ${
            isListening
              ? 'bg-green-600 hover:bg-green-700 animate-pulse'
              : 'bg-red-600 hover:bg-red-700'
          } ${!isCameraOn ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isListening ? 'Mute' : 'Unmute'}
        >
          {isListening ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0L18.485 7.757a1 1 0 010 1.414L17.071 10.586a1 1 0 11-1.414-1.414L16.243 8.586l-.586-.586a1 1 0 010-1.414l.586-.586a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Camera Button */}
        <button
          onClick={toggleCamera}
          className={`rounded-full w-12 h-12 flex items-center justify-center ${getThemeClasses('text-white')} font-medium transition-all ${
            isCameraOn
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraOn ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a2 2 0 00-2-2h-2.586l-1.707-1.707A1 1 0 0011 3H9a1 1 0 00-.707.293L6.586 5H4a2 2 0 00-2 2v6c0 .695.355 1.308.894 1.664L3.707 2.293z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Camera Switch Button - Show only if multiple cameras available */}
        {availableCameras.length > 1 && (
          <button
            onClick={onSwitchCamera}
            disabled={!isCameraOn}
            className={`rounded-full w-12 h-12 flex items-center justify-center ${getThemeClasses('text-white')} font-medium transition-all ${
              isCameraOn
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-600 opacity-50 cursor-not-allowed'
            }`}
            title="Switch camera"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9 4h6l1.83 2H15v2h2v10H7V8h2V6h1.83L9 4z"/>
              <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              <path d="M16 2l2 2-2 2V4h-2V2h2z"/>
            </svg>
          </button>
        )}

        {/* End Call Button */}
        <button
          onClick={endCall}
          className={`rounded-full w-16 h-12 flex items-center justify-center bg-red-600 hover:bg-red-700 ${getThemeClasses('text-white')} font-medium transition-all`}
          title="End call"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </button>
      </div>
    </div>
  );
}