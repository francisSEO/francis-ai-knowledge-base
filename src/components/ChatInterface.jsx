import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Link as LinkIcon, ExternalLink, Bot, User } from 'lucide-react';
import { chatWithAI } from '../services/openai';

const ThinkingIndicator = () => {
  const [step, setStep] = useState(0);
  const steps = [
    "Reading your saved links...",
    "Analyzing content...",
    "Connecting the dots...",
    "Formulating answer..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 text-sm text-gray-500 animate-pulse">
      <Sparkles size={16} className="text-purple-500" />
      <span>{steps[step]}</span>
    </div>
  );
};

export default function ChatInterface({ urlContents }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithAI(userMessage, urlContents);
      // response is expected to be { answer: string, sources: number[] }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.answer,
        sources: response.sources
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. ' + error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceDetails = (index) => {
    if (!urlContents || index < 0 || index >= urlContents.length) return null;
    return urlContents[index];
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-icon">
          <Bot size={20} />
        </div>
        <div>
          <h3>AI Assistant</h3>
          <p>Ask about your {urlContents?.length || 0} saved links</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <div className="empty-state-icon">
              <Sparkles size={48} />
            </div>
            <h3>How can I help you today?</h3>
            <p>I can analyze your saved links and answer questions based on their content.</p>
            <div className="suggestions">
              <button onClick={() => setInput("Summarize my latest saved links")} className="suggestion-chip">
                Summarize my latest links
              </button>
              <button onClick={() => setInput("What are the main topics in my list?")} className="suggestion-chip">
                Main topics
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-content-wrapper">
              <div className="message-content">
                {message.content}
              </div>

              {message.sources && message.sources.length > 0 && (
                <div className="sources-list">
                  <p className="sources-label">Sources used:</p>
                  <div className="sources-grid">
                    {message.sources.map((sourceIndex, idx) => {
                      const source = getSourceDetails(sourceIndex);
                      if (!source) return null;
                      return (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-card"
                        >
                          <div className="source-icon">
                            <LinkIcon size={12} />
                          </div>
                          <span className="source-title">{source.title || source.url}</span>
                          <ExternalLink size={10} className="external-icon" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-assistant">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-content-wrapper">
              <div className="thinking-bubble">
                <ThinkingIndicator />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your links..."
          className="input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn-send"
          disabled={isLoading || !input.trim()}
        >
          <Send size={18} />
        </button>
      </form>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .chat-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-header h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .chat-header p {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin: 0;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: var(--bg-secondary);
        }

        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-tertiary);
          text-align: center;
          padding: 2rem;
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: var(--accent);
        }

        .empty-chat h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .suggestions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .suggestion-chip {
          padding: 0.5rem 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 0.875rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-chip:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-light);
        }

        .message {
          display: flex;
          gap: 0.75rem;
          animation: fadeIn 300ms ease-out;
          max-width: 85%;
        }

        .message-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-assistant {
          align-self: flex-start;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-user .message-avatar {
          background: var(--accent);
          color: white;
        }

        .message-assistant .message-avatar {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }

        .message-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.9375rem;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .message-user .message-content {
          background: var(--accent);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-assistant .message-content {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }

        .sources-list {
          margin-top: 0.25rem;
        }

        .sources-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .sources-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .source-card {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
          max-width: 200px;
        }

        .source-card:hover {
          border-color: var(--accent);
          background: var(--accent-light);
          color: var(--accent-dark);
        }

        .source-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .thinking-bubble {
          padding: 0.75rem 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 12px;
          border-bottom-left-radius: 4px;
        }

        .chat-input-form {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-top: 1px solid var(--border);
          background: var(--bg-primary);
        }

        .chat-input-form .input {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .chat-input-form .input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-light);
        }

        .btn-send {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-send:hover:not(:disabled) {
          background: var(--accent-dark);
          transform: scale(1.05);
        }

        .btn-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
