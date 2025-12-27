import { useState } from 'react';
import { Loader } from 'lucide-react';
import { extractUrlContent } from '../services/openai';
import { saveUrl } from '../services/firestore';

export default function AddUrlForm({ onUrlAdded }) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Product');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['SEO', 'Product', 'Analysis', 'Strategy', 'Leadership', 'Frameworks', 'Business'];

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
      // Split tags by comma and trim
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

      const extracted = await extractUrlContent(url, {
        manualCategory: category,
        manualTags: tagList
      });

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
      setTags('');
      setCategory('Product'); // reset to default

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
        <div className="input-group full-width">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a URL..."
            className="input"
            disabled={isLoading}
          />
        </div>

        <div className="input-row">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select"
            disabled={isLoading}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)..."
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
        </div>

        {error && (
          <div className="alert alert-error animate-fade-in">
            {error}
          </div>
        )}
      </form>

      <style jsx>{`
        .add-url-form {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .full-width {
            width: 100%;
        }

        .input-row {
            display: flex;
            gap: 0.75rem;
            align-items: center;
        }

        .input, .select {
            padding: 0.625rem 0.875rem;
            background: var(--bg-primary);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            color: var(--text-primary);
            font-size: 0.9375rem;
            transition: all var(--transition);
        }
        
        .input:focus, .select:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
        }

        .input {
          flex: 1;
        }
        
        .select {
            width: 140px;
            cursor: pointer;
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
          .input-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
