import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FrontPage.css';

const FrontPage = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/issues/public');
        if (!response.ok) {
          throw new Error('Failed to fetch issues');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }
        setIssues(data);
      } catch (err) {
        setError('Failed to load issues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  return (
    <div className="front-page">
      <nav className="front-nav">
        <div className="nav-logo">HelpHim</div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/login')} className="login-btn">Login</button>
          <button onClick={() => navigate('/register')} className="register-btn">Register</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Welcome to HelpHim</h1>
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

      {/* Issues List Section */}
      <section className="issues-section">
        <h2 className="issues-title">Reported Issues</h2>
        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <div className="loading-message">Loading issues...</div>
        ) : (
          <div className="issues-grid">
            {Array.isArray(issues) && issues.length > 0 ? (
              issues.map((issue) => (
                <div key={issue._id} className="issue-card">
                  <img
                    src={issue.photo ? `http://localhost:4000${issue.photo}` : '/placeholder-image.png'}
                    alt={issue.title}
                    className="issue-image"
                    onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                  />
                  <h3 className="issue-title">{issue.title}</h3>
                  <p className="issue-description">{issue.description}</p>
                  <p className="issue-specialization">{issue.specialization}</p>
                  <span className="issue-status">{issue.status}</span>
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