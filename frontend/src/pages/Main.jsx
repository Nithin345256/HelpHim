import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

const FrontPage = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/issues/public');
        setIssues(response.data);
      } catch (err) {
        setError('Failed to load issues. Please try again later.');
      }
    };
    fetchIssues();
  }, []);

  return (
    <div className="frontpage-container">
      <style>
        {`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        .frontpage-container {
          min-height: 100vh;
          background-color: #1A3C34;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          background-color: #2E7D32;
          padding: 15px 20px;
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 100;
        }

        .navbar-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          font-size: 24px;
          color: #FFFFFF;
          font-weight: bold;
        }

        .navbar-links a {
          color: #FFFFFF;
          text-decoration: none;
          font-size: 16px;
          padding: 8px 12px;
          margin-left: 10px;
          border-radius: 4px;
          background-color: #1B5E20;
          transition: background-color 0.3s;
        }

        .navbar-links a:hover {
          background-color: #2E7D32;
        }

        .hero-section {
          background-image: url('https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200');
          background-size: cover;
          background-position: center;
          padding: 100px 20px;
          text-align: center;
          margin-top: 70px;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          background-color: rgba(29, 60, 52, 0.8);
          padding: 30px;
          border-radius: 10px;
        }

        .hero-title {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .hero-subtitle {
          font-size: 18px;
          line-height: 1.6;
        }

        .issues-section {
          padding: 40px 20px;
          flex-grow: 1;
        }

        .issues-title {
          font-size: 28px;
          text-align: center;
          margin-bottom: 30px;
        }

        .issues-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .issue-card {
          background-color: #2D2D2D;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s;
        }

        .issue-card:hover {
          transform: translateY(-5px);
        }

        .issue-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 15px;
        }

        .issue-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .issue-description {
          font-size: 14px;
          color: #D1D5DB;
          margin-bottom: 10px;
        }

        .issue-specialization {
          font-size: 14px;
          color: #2E7D32;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .issue-status {
          font-size: 14px;
          color: #FFFFFF;
          background-color: #1B5E20;
          padding: 5px 10px;
          border-radius: 4px;
          display: inline-block;
        }

        .error-message {
          color: #EF4444;
          font-size: 16px;
          text-align: center;
          margin: 20px 0;
        }

        .footer {
          background-color: #2E7D32;
          color: #FFFFFF;
          text-align: center;
          padding: 15px;
          margin-top: auto;
        }

        .footer-links {
          margin-top: 10px;
        }

        .footer-link {
          color: #FFFFFF;
          text-decoration: none;
          margin: 0 10px;
          font-size: 14px;
        }

        .footer-link:hover {
          text-decoration: underline;
        }

        .error-container {
          text-align: center;
          padding: 20px;
          color: #FFFFFF;
        }

        .error-container h2 {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .error-container p {
          font-size: 16px;
          margin-bottom: 20px;
        }

        .error-container button {
          padding: 10px 20px;
          background-color: #2E7D32;
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .error-container button:hover {
          background-color: #1B5E20;
        }

        @media (max-width: 600px) {
          .hero-section {
            padding: 80px 15px;
          }

          .hero-title {
            font-size: 28px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .issues-grid {
            grid-template-columns: 1fr;
          }
        }
      `}
      </style>

      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-logo">Bengaluru Issue Reporter</h1>
          <div className="navbar-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Report and Track Bengaluru's Civic Issues</h2>
          <p className="hero-subtitle">
            Join our community to report potholes, garbage, water issues, and more. Together, we can make Bengaluru better!
          </p>
        </div>
      </section>

      <section className="issues-section">
        <h2 className="issues-title">Reported Issues</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="issues-grid">
          {issues.map((issue) => (
            <div key={issue._id} className="issue-card">
              {issue.photo && (
                <img
                  src={`http://localhost:4000${issue.photo}`}
                  alt={issue.title}
                  className="issue-image"
                />
              )}
              <h3 className="issue-title">{issue.title}</h3>
              <p className="issue-description">{issue.description}</p>
              <p className="issue-specialization">{issue.specialization}</p>
              <span className="issue-status">{issue.status}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 Bengaluru Issue Reporter. All rights reserved.</p>
        <div className="footer-links">
          <a href="#" className="footer-link">Contact BBMP</a>
          <a href="#" className="footer-link">Twitter</a>
          <a href="#" className="footer-link">Facebook</a>
        </div>
      </footer>
    </div>
  );
};

export default function FrontPageWithBoundary() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <FrontPage />
    </ErrorBoundary>
  );
}