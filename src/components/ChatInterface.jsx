import { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { chatWithAI } from '../services/openai';

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
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithAI(userMessage, urlContents);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: ' + error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <p>Ask me anything about your saved links</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-assistant">
            <div className="message-content">
              <Loader className="spinner" size={14} />
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
          placeholder="Ask a question..."
          className="input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !input.trim()}
        >
          <Send size={14} />
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
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .empty-chat {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }

        .message {
          display: flex;
          animation: fadeIn 200ms ease-out;
        }

        .message-user {
          justify-content: flex-end;
        }

        .message-content {
          max-width: 80%;
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .message-user .message-content {
          background: var(--accent);
          color: white;
        }

        .message-assistant .message-content {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .chat-input-form {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem;
          border-top: 1px solid var(--border);
          background: var(--bg-primary);
        }

        .chat-input-form .input {
          flex: 1;
        }

        .chat-input-form .btn {
          flex-shrink: 0;
          padding: 0.5rem 0.75rem;
        }

        @media (max-width: 768px) {
          .chat-container {
            height: 500px;
          }

          .message-content {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
}
