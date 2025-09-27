import React, { useRef, useEffect } from 'react';

const MessageDisplay = ({ messages, title = "Conversation", showCopy = true, onCopy }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopy = () => {
    const conversationText = messages
      .map(msg => `[${formatTime(msg.timestamp)}] ${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n');

    if (onCopy) {
      onCopy(conversationText);
    } else {
      navigator.clipboard.writeText(conversationText).then(() => {
        alert('Conversation copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  return (
    <div className="message-display bg-slate-800/50 rounded-xl p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          {showCopy && messages.length > 0 && (
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-all"
              title="Copy conversation"
            >
              📋 Copy
            </button>
          )}
          <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="bg-slate-700/50 rounded-lg p-3 h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <p>No messages yet</p>
              <p className="text-sm mt-1">Start a conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`message-item ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-slate-600 text-white'
                }`}>
                  <div className="message-content">
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs opacity-70">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Count & Status */}
      {messages.length > 0 && (
        <div className="mt-2 text-xs text-slate-400 text-center">
          Last message: {formatTime(messages[messages.length - 1]?.timestamp)}
        </div>
      )}
    </div>
  );
};

export default MessageDisplay;