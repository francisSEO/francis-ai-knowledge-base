import { useState } from 'react';
import { Loader } from 'lucide-react';
import { extractUrlContent } from '../services/openai';
import { saveUrl } from '../services/firestore';

export default function AddUrlForm({ onUrlAdded }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);

    try {
      const extracted = await extractUrlContent(url);

      const savedUrl = await saveUrl({
        title: extracted.title,
        summary: extracted.summary,
        content: extracted.content,
        category: extracted.category,
        tags: extracted.tags,
        url: extracted.url,
        source: extracted.source,
        timestamp: extracted.timestamp
      });

      setUrl('');

      if (onUrlAdded) {
        onUrlAdded(savedUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-url-form">
      <form onSubmit={handleSubmit} className="form-content">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL..."
          className="input"
          disabled={isLoading}
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="spinner" size={16} />
              Analyzing...
            </>
          ) : (
            'Add Link'
          )}
        </button>

        {error && (
          <div className="alert alert-error animate-fade-in">
            {error}
          </div>
        )}
      </form>

      <style jsx>{`
        .add-url-form {
          margin-bottom: 1.5rem;
        }

        .form-content {
          display: flex;
          gap: 0.5rem;
        }

        .input {
          flex: 1;
        }

        .btn-primary {
          flex-shrink: 0;
        }

        .alert {
          margin-top: 0.75rem;
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius);
          font-size: 0.8125rem;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: rgba(239, 68, 68, 0.9);
        }

        @media (max-width: 768px) {
          .form-content {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
