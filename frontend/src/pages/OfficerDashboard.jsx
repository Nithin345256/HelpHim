import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OfficerDashboard.css';

// Helper to get place name from lat/lng
async function getPlaceName(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

const OfficerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [issuePlaces, setIssuePlaces] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({}); // Track which issues are being updated
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First get the profile to get specialization
        const profileRes = await axios.get('https://helphim.onrender.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!profileRes.data) {
          throw new Error('Failed to fetch profile data');
        }

        setProfile(profileRes.data);
        console.log('Profile data:', profileRes.data);

        // Then get all issues - let the backend filter them
        const issuesRes = await axios.get('https://helphim.onrender.com/api/issues', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!issuesRes.data) {
          throw new Error('Failed to fetch issues');
        }

        console.log('Issues from backend:', issuesRes.data);
        setIssues(issuesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Helper to get place names for all issues
  useEffect(() => {
    async function fetchPlaces() {
      const places = {};
      for (const issue of issues) {
        if (issue.location && issue.location.coordinates) {
          const [lng, lat] = issue.location.coordinates;
          places[issue._id] = await getPlaceName(lat, lng);
        }
      }
      setIssuePlaces(places);
    }
    if (issues.length > 0) fetchPlaces();
  }, [issues]);

  const handleStatusChange = async (issueId, newStatus) => {
    const token = localStorage.getItem('token');
    
    // Prevent multiple simultaneous updates
    if (updatingStatus[issueId]) {
      return;
    }

    setUpdatingStatus(prev => ({ ...prev, [issueId]: true }));

    try {
      console.log(`Updating issue ${issueId} status to ${newStatus}`);
      
      const response = await axios.put(
        `https://helphim.onrender.com/api/issues/${issueId}`,
        { status: newStatus },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Update response:', response.data);

      // Update the local state immediately for better UX
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue._id === issueId 
            ? { ...issue, status: newStatus }
            : issue
        )
      );

      // If status is "Resolved", remove from list (since officers only see non-resolved issues)
      if (newStatus === 'Resolved') {
        setIssues(prevIssues => prevIssues.filter(issue => issue._id !== issueId));
      }

    } catch (err) {
      console.error('Status update error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to update status.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        localStorage.removeItem('token');
        navigate('/login');
        return;
      } else if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to update this issue.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Issue not found.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(errorMessage);
      
      // Refresh the page data to ensure consistency
      window.location.reload();
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [issueId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>Profile data not found. Please try logging in again.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Officer Dashboard</h1>
        <div className="profile-info">
          <h2>Welcome, {profile.username}</h2>
          <p>Specialization: {profile.specialization}</p>
          <p>Role: {profile.role}</p>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="no-issues">
          <p>No issues found for your specialization ({profile.specialization})</p>
        </div>
      ) : (
        <div className="issues-list">
          {issues.map((issue) => (
            <div key={issue._id} className="issue-card">
              <div className="issue-header">
                <h3>{issue.title}</h3>
                <span className={`status-badge ${issue.status}`}>
                  {issue.status}
                </span>
              </div>
              {issue.photo && (
                <img
                  src={`https://helphim.onrender.com${issue.photo}`}
                  alt={issue.title}
                  className="issue-photo"
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }}
                />
              )}
              <p className="issue-description">{issue.description}</p>
              <div className="issue-meta">
                <span><b>Specialization:</b> {issue.specialization}</span><br/>
                <span><b>Location:</b> {issuePlaces[issue._id] || 'N/A'}</span><br/>
                <span><b>Date:</b> {new Date(issue.createdAt).toLocaleString()}</span><br/>
                <span><b>Likes:</b> {issue.likes ? issue.likes.length : 0}</span><br/>
                <span><b>Comments:</b> {issue.comments ? issue.comments.length : 0}</span>
              </div>
              <div className="status-actions">
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                  className="status-select"
                  disabled={updatingStatus[issue._id]}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                {updatingStatus[issue._id] && <span className="updating-indicator">Updating...</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;