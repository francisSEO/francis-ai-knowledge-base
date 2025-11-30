import { useState } from 'react';
import { ExternalLink, Trash2, Filter, ArrowUpDown } from 'lucide-react';
import { deleteUrl } from '../services/firestore';

export default function UrlList({ urls, onUrlDeleted }) {
  const [deletingId, setDeletingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // date, title

  const handleDelete = async (urlId) => {
    if (!confirm('Delete this link?')) {
      return;
    }

    setDeletingId(urlId);
    try {
      await deleteUrl(urlId);
      if (onUrlDeleted) {
        onUrlDeleted(urlId);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Get unique categories and tags
  const categories = ['all', ...new Set(urls.map(url => url.category).filter(Boolean))];
  const allTags = ['all', ...new Set(urls.flatMap(url => url.tags || []))];

  // Filter URLs
  let filteredUrls = urls.filter(url => {
    const matchesCategory = filterCategory === 'all' || url.category === filterCategory;
    const matchesTag = filterTag === 'all' || (url.tags && url.tags.includes(filterTag));
    return matchesCategory && matchesTag;
  });

  // Sort URLs
  filteredUrls = [...filteredUrls].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA; // Newest first
    } else if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  if (urls.length === 0) {
    return (
      <div className="empty-state">
        <p>No links yet</p>
        <style jsx>{`
                    .empty-state {
                        text-align: center;
                        padding: 3rem 1rem;
                        color: var(--text-tertiary);
                        font-size: 0.875rem;
                    }
                `}</style>
      </div>
    );
  }

  return (
    <div className="url-list-container">
      <div className="filters">
        <div className="filter-group">
          <Filter size={14} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="filter-select"
          >
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag === 'all' ? 'All tags' : tag}
              </option>
            ))}
          </select>
        </div>




      </div>

      <div className="url-list">
        {filteredUrls.map((url, index) => (
          <div
            key={url.id}
            className="url-item hover-lift"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="url-header">
              <span className="url-category">{url.category}</span>
              <button
                onClick={() => handleDelete(url.id)}
                className="btn-delete"
                disabled={deletingId === url.id}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <h3 className="url-title">{url.title}</h3>

            <p className="url-content">
              {url.summary?.substring(0, 100)}
              {url.summary?.length > 100 ? '...' : ''}
            </p>

            {url.tags && url.tags.length > 0 && (
              <div className="url-tags">
                {url.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            )}

            <div className="url-footer">
              <a
                href={url.url}
                target="_blank"
                rel="noopener noreferrer"
                className="url-link"
              >
                {url.source || 'View'}
              </a>
              <span className="url-date">
                {url.createdAt?.toDate?.().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
                .url-list-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .filters {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: var(--bg-primary);
                    margin-top: 2rem;

                }

                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    color: var(--text-tertiary);
                }

                .filter-select {
                    padding: 0.25rem 0.5rem;
                    background: transparent;
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    color: var(--text-tertiary);
                    font-size: 0.8125rem;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all var(--transition);
                }

                .filter-select:hover {
                    border-color: var(--border-hover);
                }

                .filter-select:focus {
                    outline: none;
                    border-color: var(--accent);
                }
                  option {
                    color: var(--bg-secondary);
                  }

                .results-count {
                    margin-left: auto;
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                }

                .url-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .url-item {
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    animation: fadeIn 200ms ease-out both;
                    cursor: pointer;
                }

                .url-item:hover {
                    border-color: var(--border-hover);
                    background: var(--bg-hover);
                }

                .url-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.625rem;
                }

                .url-category {
                    display: inline-block;
                    padding: 0.125rem 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius);
                    font-size: 0.6875rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    font-weight: 500;
                }

                .btn-delete {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.25rem;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius);
                    color: var(--text-tertiary);
                    cursor: pointer;
                    transition: all var(--transition);
                    opacity: 0;
                }

                .url-item:hover .btn-delete {
                    opacity: 1;
                }

                .btn-delete:hover:not(:disabled) {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .btn-delete:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .url-title {
                    font-size: 0.9375rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    line-height: 1.4;
                    color: var(--text-primary);
                }

                .url-content {
                    color: var(--text-secondary);
                    font-size: 0.8125rem;
                    line-height: 1.5;
                    margin-bottom: 0.75rem;
                }

                .url-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.375rem;
                    margin-bottom: 0.75rem;
                }

                .tag {
                    display: inline-block;
                    padding: 0.125rem 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    font-size: 0.6875rem;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                .url-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 0.625rem;
                    border-top: 1px solid var(--border);
                }

                .url-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    color: var(--accent);
                    text-decoration: none;
                    font-size: 0.75rem;
                    font-weight: 500;
                    transition: all var(--transition);
                }

                .url-link:hover {
                    color: var(--accent-hover);
                    gap: 0.375rem;
                }

                .url-date {
                    color: var(--text-tertiary);
                    font-size: 0.6875rem;
                }

                @media (max-width: 768px) {
                    .filters {
                        flex-wrap: wrap;
                    }

                    .results-count {
                        width: 100%;
                        margin-left: 0;
                        margin-top: 0.5rem;
                    }
                }
            `}</style>
    </div>
  );
}
