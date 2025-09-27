import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { SpeakerControls } from './SpeakerControls';

export function SidePanel({
  isOpen,
  isGenerating,
  isThinking,
  storyContent,
  onConversation,
  conversationHistory,
  isDarkTheme = true,
  isListening = false,
  children
}) {
  const [userInput, setUserInput] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copyStatus, setCopyStatus] = useState({});
  const scrollAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleAsk = () => {
    if (userInput.trim() || selectedImage) {
      onConversation(userInput || 'What do you see in this image?', selectedImage);
      setUserInput('');
      setSelectedImage(null);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getThemeClasses = (baseClasses) => {
    if (isDarkTheme) {
      return baseClasses;
    } else {
      // Light theme replacements
      return baseClasses
        .replace(/bg-black\/90/g, 'bg-white/90')
        .replace(/bg-black\/75/g, 'bg-white/90')
        .replace(/bg-black\/50/g, 'bg-white/80')
        .replace(/bg-black/g, 'bg-white')
        .replace(/bg-slate-800\/90/g, 'bg-gray-100/90')
        .replace(/bg-slate-800\/50/g, 'bg-gray-100/80')
        .replace(/bg-slate-800/g, 'bg-gray-100')
        .replace(/bg-slate-700/g, 'bg-gray-200')
        .replace(/bg-slate-600/g, 'bg-gray-300')
        .replace(/bg-slate-500/g, 'bg-gray-400')
        .replace(/text-white/g, 'text-gray-900')
        .replace(/text-slate-300/g, 'text-gray-600')
        .replace(/text-slate-400/g, 'text-gray-500')
        .replace(/border-slate-600/g, 'border-gray-300')
        .replace(/border-slate-700/g, 'border-gray-400')
        .replace(/placeholder-slate-400/g, 'placeholder-gray-500');
    }
  };

  const copyToClipboard = async (text, messageIndex) => {
    try {
      // Show copying status
      setCopyStatus(prev => ({ ...prev, [messageIndex]: 'copying' }));

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        console.log('Text copied to clipboard successfully');
        setCopyStatus(prev => ({ ...prev, [messageIndex]: 'success' }));
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          console.log('Text copied using fallback method');
          setCopyStatus(prev => ({ ...prev, [messageIndex]: 'success' }));
        } else {
          throw new Error('Fallback copy command failed');
        }
      }

      // Reset status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [messageIndex]: null }));
      }, 2000);

    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus(prev => ({ ...prev, [messageIndex]: 'error' }));

      // Reset error status after 3 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [messageIndex]: null }));
      }, 3000);
    }
  };

  const formatText = (text) => {
    // Basic markdown-like formatting for better display
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-600 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversationHistory]);



  return (
    <aside
      className={cn(
        getThemeClasses('flex flex-col bg-slate-800/90 backdrop-blur-sm border-l border-slate-600 transition-all duration-300 ease-in-out'),
        isOpen
          ? 'w-full xs:w-80 sm:w-96 md:w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem]'
          : 'w-0',
        'min-w-0 overflow-hidden h-full'
      )}
    >
      <div className={cn('flex flex-col h-full overflow-hidden', !isOpen && 'invisible')}>
        {/* Chat Section */}
          <div className="flex-1 flex flex-col p-1 xs:p-2 sm:p-3 md:p-4 pt-1 xs:pt-2 sm:pt-3 md:pt-4 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 min-h-0 pr-1 sm:pr-2 mb-2 sm:mb-3 md:mb-4 overflow-hidden" ref={scrollAreaRef} style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <div className="space-y-1 xs:space-y-2 sm:space-y-3 md:space-y-4">
                {conversationHistory.map((entry, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-1 xs:gap-2 sm:gap-3 group",
                      entry.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {entry.role === 'model' && (
                      <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs sm:text-sm">
                        🤖
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 max-w-[75%] xs:max-w-[70%] sm:max-w-[65%] md:max-w-sm lg:max-w-md">
                      <div
                        className={cn(
                          "rounded-lg px-2 xs:px-3 sm:px-3 md:px-4 py-1 xs:py-1.5 sm:py-2 text-xs xs:text-sm sm:text-sm relative min-w-0 overflow-hidden",
                          entry.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : getThemeClasses('bg-slate-700 text-white')
                        )}
                      >
                        {entry.image && (
                          <div className="mb-2">
                            <img
                              src={entry.image}
                              alt="User uploaded"
                              className="max-w-full h-32 object-contain bg-slate-600 rounded"
                            />
                          </div>
                        )}
                        <div
                          className="whitespace-pre-wrap break-words word-wrap-break-word"
                          style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                          dangerouslySetInnerHTML={{ __html: formatText(entry.text) }}
                        />

                        {/* Action buttons for AI responses */}
                        {entry.role === 'model' && (
                          <div className="flex items-center gap-1 mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(entry.text, index)}
                              className={`p-1 text-xs transition-all ${
                                copyStatus[index] === 'success'
                                  ? 'text-green-400'
                                  : copyStatus[index] === 'error'
                                  ? 'text-red-400'
                                  : copyStatus[index] === 'copying'
                                  ? 'text-yellow-400'
                                  : getThemeClasses('text-slate-400 hover:text-white')
                              }`}
                              title={
                                copyStatus[index] === 'success'
                                  ? 'Copied!'
                                  : copyStatus[index] === 'error'
                                  ? 'Copy failed'
                                  : copyStatus[index] === 'copying'
                                  ? 'Copying...'
                                  : 'Copy response'
                              }
                              disabled={copyStatus[index] === 'copying'}
                            >
                              {copyStatus[index] === 'success' ? '✅' :
                               copyStatus[index] === 'error' ? '❌' :
                               copyStatus[index] === 'copying' ? '⏳' : '📋'}
                            </button>
                            <div className="flex-1 scale-75 sm:scale-100 origin-left">
                              <SpeakerControls
                                text={entry.text}
                                isAutoPlay={false}
                                isDarkTheme={isDarkTheme}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {entry.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm">
                        👤
                      </div>
                    )}
                  </div>
                ))}
                {isThinking && (
                  <div className="flex items-start gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                      🤖
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-slate-700 flex items-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image Preview */}
            {selectedImage && (
              <div className="mb-2 relative">
                <img
                  src={selectedImage}
                  alt="Upload preview"
                  className="max-w-full h-32 object-contain bg-slate-600 rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            )}


            {/* Input */}
            <div className="flex items-center gap-1 xs:gap-2 sm:gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={getThemeClasses("p-2 xs:p-2.5 sm:p-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-all text-sm xs:text-base")}
                title="Upload image"
              >
                📷
              </button>
              <input
                type="text"
                placeholder="Type message or just start speaking..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk()}
                disabled={isThinking}
                className={getThemeClasses("flex-1 p-2 xs:p-2.5 sm:p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-white placeholder-slate-400 text-xs xs:text-sm sm:text-base")}
              />
              <button
                onClick={handleAsk}
                disabled={isThinking || (!userInput.trim() && !selectedImage)}
                className={getThemeClasses("px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-all text-xs xs:text-sm sm:text-base")}
              >
                {isThinking ? (
                  <div className="w-3 h-3 xs:w-4 xs:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </div>

        {/* Debug Controls */}
        {children && (
          <div className={getThemeClasses("border-t border-slate-600")}>
            <div className="p-2 xs:p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 xs:mb-3">
                <div className={getThemeClasses("flex items-center gap-1 xs:gap-2 text-xs xs:text-sm font-semibold text-slate-300")}>
                  <span className="text-sm xs:text-base sm:text-lg">🧪</span>
                  <span className="hidden xs:inline">Debug Controls</span>
                  <span className="xs:hidden">Debug</span>
                </div>
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className={`px-2 xs:px-3 py-1 text-xs rounded transition-colors ${
                    showDebug
                      ? 'bg-blue-600 text-white'
                      : getThemeClasses('bg-slate-600 text-slate-300 hover:bg-slate-500')
                  }`}
                >
                  {showDebug ? 'Hide' : 'Show'}
                </button>
              </div>
              {showDebug && (
                <div className="mt-2 xs:mt-3 max-h-48 xs:max-h-64 sm:max-h-80 lg:max-h-96 xl:max-h-[32rem] overflow-y-auto overflow-x-hidden">
                  <div className="min-w-0 w-full">
                    {React.cloneElement(children, { onSay: onConversation })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}