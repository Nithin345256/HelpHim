import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FrontPage.css';

const FrontPage = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [sessionId, setSessionId] = useState(null);

  // Generate or retrieve a session ID for anonymous users
  useEffect(() => {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('sessionId', sid);
    }
    setSessionId(sid);
  }, []);

  // Fetch issues and their comments
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('https://helphim-1.onrender.com/api/issues/public', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            throw new Error(data.message || `Failed to fetch issues: ${response.statusText}`);
          } catch {
            throw new Error(`Invalid response format: ${response.statusText}`);
          }
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: Expected an array');
        }
        const issuesWithComments = await Promise.all(
          data.map(async (issue) => {
            const commentsResponse = await fetch(`https://helphim-1.onrender.com/api/issues/${issue._id}/comments`, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (!commentsResponse.ok) {
              console.warn(`Failed to fetch comments for issue ${issue._id}: ${commentsResponse.statusText}`);
              return { ...issue, comments: [] };
            }
            const commentsData = await commentsResponse.json();
            return { ...issue, comments: commentsData || [], likes: Array.isArray(issue.likes) ? issue.likes : [] };
          })
        );
        setIssues(issuesWithComments);
      } catch (err) {
        setError(`Failed to load issues: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  // Handle like/unlike
  const handleLike = async (issueId) => {
    setActionLoading((prev) => ({ ...prev, [issueId]: { ...prev[issueId], like: true } }));
    try {
      const response = await fetch(`https://helphim-1.onrender.com/api/issues/${issueId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
        },
      });
      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.message || `Failed to like issue: ${response.statusText}`);
        } catch {
          throw new Error(`Invalid response format: ${response.statusText}`);
        }
      }
      const data = await response.json();
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId ? { ...issue, likes: Array.isArray(data.likes) ? data.likes : [] } : issue
        )
      );
    } catch (err) {
      setError(`Failed to like issue: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [issueId]: { ...prev[issueId], like: false } }));
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (issueId) => {
    const commentText = commentInputs[issueId]?.trim();
    if (!commentText) {
      setError('Comment cannot be empty.');
      return;
    }
    setActionLoading((prev) => ({ ...prev, [issueId]: { ...prev[issueId], comment: true } }));
    try {
      const response = await fetch(`https://helphim-1.onrender.com/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({ content: commentText }),
      });
      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.message || `Failed to add comment: ${response.statusText}`);
        } catch {
          throw new Error(`Invalid response format: ${response.statusText}`);
        }
      }
      const data = await response.json();
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId
            ? { ...issue, comments: [...issue.comments, data] }
            : issue
        )
      );
      setCommentInputs((prev) => ({ ...prev, [issueId]: '' }));
    } catch (err) {
      setError(`Failed to add comment: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [issueId]: { ...prev[issueId], comment: false } }));
    }
  };

  // Handle comment input change
  const handleCommentChange = (issueId, value) => {
    setCommentInputs((prev) => ({ ...prev, [issueId]: value }));
  };

  return (
    <div className="front-page">
      <nav className="front-nav">
        <div className="nav-logo">IssueBridge</div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/login')} className="login-btn">Login</button>
          <button onClick={() => navigate('/register')} className="register-btn">Register</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Welcome to IssueBridge</h1>
          <p className="hero-subtitle">Your platform for community support and assistance</p>
          <div className="hero-description">
            <p>Connect with your community, get help when you need it, and make a difference in others' lives.</p>
          </div>
          <div className="cta-buttons">
            <button onClick={() => navigate('/register')} className="cta-primary">Get Started</button>
            <button onClick={() => navigate('/login')} className="cta-secondary">Sign In</button>
          </div>
        </div>
      </main>

      <section className="features-section">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Post Your Issue</h3>
            <p>Share your concerns or requests for help with the community</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Connect with Officers</h3>
            <p>Get assistance from specialized community officers</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Engage & Discuss</h3>
            <p>Participate in discussions and provide feedback</p>
          </div>
        </div>
      </section>

      <section className="issues-section">
        <h2 className="issues-title">Reported Issues</h2>
        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <div className="loading-message">Loading issues...</div>
        ) : (
          <div className="issues-grid">
            {Array.isArray(issues) && issues.length > 0 ? (
              issues.map((issue) => (
                <div key={issue._id} className="issue-row">
                  <div className="issue-image-container">
                    <img
                      src={issue.photo ? `https://helphim-1.onrender.com${issue.photo}` : '/placeholder-image.png'}
                      alt={issue.title}
                      className="issue-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                  <div className="issue-content">
                    <h3 className="issue-title">{issue.title}</h3>
                    <p className="issue-description">{issue.description}</p>
                    <div className="issue-meta">
                      <span className="issue-specialization">{issue.specialization}</span>
                      <span className="issue-status">{issue.status}</span>
                    </div>
                    <div className="issue-actions">
                      <button
                        className={`like-btn ${Array.isArray(issue.likes) && issue.likes.includes(sessionId) ? 'liked' : ''}`}
                        onClick={() => handleLike(issue._id)}
                        disabled={actionLoading[issue._id]?.like}
                      >
                        <span className="like-icon">❤️</span>
                        {Array.isArray(issue.likes) && issue.likes.includes(sessionId) ? 'Unlike' : 'Like'} ({Array.isArray(issue.likes) ? issue.likes.length : 0})
                      </button>
                    </div>
                    <div className="comments-section">
                      <h4>Comments</h4>
                      {issue.comments.length > 0 ? (
                        <ul className="comments-list">
                          {issue.comments.map((comment) => (
                            <li key={comment._id} className="comment-item">
                              <p>
                                <strong>{comment.author?.username || 'Anonymous'}</strong>: {comment.content}
                              </p>
                              <span className="comment-date">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-comments">No comments yet.</p>
                      )}
                      <div className="comment-input">
                        <textarea
                          value={commentInputs[issue._id] || ''}
                          onChange={(e) => handleCommentChange(issue._id, e.target.value)}
                          placeholder="Add a comment..."
                          disabled={actionLoading[issue._id]?.comment}
                        />
                        <button
                          onClick={() => handleCommentSubmit(issue._id)}
                          disabled={actionLoading[issue._id]?.comment}
                          className="comment-submit-btn"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-issues-message">No issues reported yet.</div>
            )}
          </div>
        )}
      </section>

      <footer className="front-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About HelpHim</h4>
            <p>Building stronger communities through mutual support and assistance.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 HelpHim. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FrontPage;