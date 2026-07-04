import React, { useState, useEffect } from 'react';

function App() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRepos = () => {
    setLoading(true);
    setError(null);

    const API_URL = process.env.NODE_ENV === 'production'
      ? '/api/repos'
      : 'http://localhost:5000/api/repos';

    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch repo data');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const liveCount = repos.filter((r) => r.status === 'Live').length;

  return (
    <div className="dashboard">
      <style>{`
        :root {
          --bg: #0f172a;
          --card: #1e293b;
          --border: #334155;
          --text: #f1f5f9;
          --muted: #94a3b8;
          --green: #16a34a;
          --red: #dc2626;
          --blue: #3b82f6;
          --orange: #f97316;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .dashboard {
          min-height: 100vh;
          background-color: var(--bg);
          color: var(--text);
          padding: 32px 24px 64px;
        }

        .header {
          max-width: 1100px;
          margin: 0 auto 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-text h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 700;
        }

        .header-text p {
          margin: 0;
          color: var(--muted);
          font-size: 15px;
        }

        .refresh-btn {
          background-color: var(--blue);
          color: var(--text);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .refresh-btn:hover {
          opacity: 0.85;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .content {
          max-width: 1100px;
          margin: 0 auto;
        }

        .status-message {
          text-align: center;
          padding: 60px 20px;
          font-size: 16px;
        }

        .error-message {
          color: var(--red);
          font-weight: 600;
        }

        .spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto 16px;
          border: 4px solid var(--border);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .card-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background-color: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .card h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          width: fit-content;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-dot.live {
          background-color: var(--green);
        }

        .status-dot.offline {
          background-color: var(--red);
        }

        .status-badge.live-text {
          color: var(--green);
        }

        .status-badge.offline-text {
          color: var(--red);
        }

        .courses-count {
          color: var(--muted);
          font-size: 14px;
        }

        .visit-btn {
          background-color: var(--orange);
          color: var(--text);
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          transition: opacity 0.15s ease;
        }

        .visit-btn:hover {
          opacity: 0.85;
        }
      `}</style>

      <div className="header">
        <div className="header-text">
          <h1>GitAcademy Repo Dashboard</h1>
          <p>{loading ? 'Checking portals...' : `${liveCount} portals live`}</p>
        </div>
        <button className="refresh-btn" onClick={fetchRepos} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="content">
        {loading && (
          <div className="status-message">
            <div className="spinner"></div>
            <div>Loading repo data...</div>
          </div>
        )}

        {!loading && error && (
          <div className="status-message error-message">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="card-grid">
            {repos.map((repo) => (
              <div className="card" key={repo.repo}>
                <h2>{repo.display_name}</h2>
                <div
                  className={`status-badge ${
                    repo.status === 'Live' ? 'live-text' : 'offline-text'
                  }`}
                >
                  <span
                    className={`status-dot ${
                      repo.status === 'Live' ? 'live' : 'offline'
                    }`}
                  ></span>
                  {repo.status}
                </div>
                <div className="courses-count">{repo.courses} Courses</div>
                <a
                  className="visit-btn"
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Site
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
