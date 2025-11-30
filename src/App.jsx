import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import AddUrlForm from './components/AddUrlForm';
import UrlList from './components/UrlList';
import ChatInterface from './components/ChatInterface';
import { getAllUrls } from './services/firestore';
import './index.css';

function App() {
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('urls');

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = async () => {
    setIsLoading(true);
    try {
      const fetchedUrls = await getAllUrls();
      setUrls(fetchedUrls);
    } catch (err) {
      console.error('Error loading URLs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlAdded = (newUrl) => {
    setUrls(prev => [newUrl, ...prev]);
  };

  const handleUrlDeleted = (urlId) => {
    setUrls(prev => prev.filter(url => url.id !== urlId));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>AI Knowledge Base</h1>
          <p className="subtitle">{urls.length} saved links</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'urls' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('urls')}
            >
              <Plus size={16} />
              Links
            </button>
            <button
              className={`tab ${activeTab === 'chat' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageCircle size={16} />
              Chat
            </button>
          </div>

          <div className="content">
            {activeTab === 'urls' ? (
              <div className="urls-section">
                <AddUrlForm onUrlAdded={handleUrlAdded} />

                {isLoading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <UrlList
                    urls={urls}
                    onUrlDeleted={handleUrlDeleted}
                  />
                )}
              </div>
            ) : (
              <div className="chat-section">
                <ChatInterface urlContents={urls} />
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          padding: 2rem 0 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .app-header h1 {
          margin-bottom: 0.25rem;
        }

        .subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .app-main {
          flex: 1;
          padding: 2rem 0;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.5rem;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: transparent;
          border: none;
          border-radius: var(--radius);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
          font-family: inherit;
        }

        .tab:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .tab-active {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .content {
          animation: fadeIn 200ms ease-out;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 1.5rem 0 1rem;
          }

          .app-main {
            padding: 1.5rem 0;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
