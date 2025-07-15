import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserDashboard.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specialization: '',
    location: null, // { lat, lng }
    photo: null
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [mapPosition, setMapPosition] = useState({ lat: 12.9716, lng: 77.5946 }); // Default to Bangalore
  const [formPlaceName, setFormPlaceName] = useState('');
  const navigate = useNavigate();

  // Helper to get place names for all complaints
  const [complaintPlaces, setComplaintPlaces] = useState({});
  useEffect(() => {
    async function fetchPlaces() {
      const places = {};
      for (const c of complaints) {
        if (c.location && c.location.coordinates) {
          const [lng, lat] = c.location.coordinates;
          places[c._id] = await getPlaceName(lat, lng);
        }
      }
      setComplaintPlaces(places);
    }
    if (complaints.length > 0) fetchPlaces();
  }, [complaints]);

  const SPECIALIZATIONS = [
    'Water Issue',
    'Sanitation',
    'Pothole',
    'Garbage',
    'Traffic',
    'Other',
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', error);
      }
    };

    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/issues/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplaints(response.data);
      } catch (error) {
        setError('Failed to fetch complaints');
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchComplaints();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'in progress':
        return '#3b82f6';
      case 'resolved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getComplaintStats = () => {
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status.toLowerCase() === 'pending').length,
      inProgress: complaints.filter(c => c.status.toLowerCase() === 'in progress').length,
      resolved: complaints.filter(c => c.status.toLowerCase() === 'resolved').length,
      rejected: complaints.filter(c => c.status.toLowerCase() === 'rejected').length
    };
    return stats;
  };

  const stats = getComplaintStats();

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMapClick = async (e) => {
    setFormData({ ...formData, location: { lat: e.latlng.lat, lng: e.latlng.lng } });
    setMapPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    const name = await getPlaceName(e.latlng.lat, e.latlng.lng);
    setFormPlaceName(name);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        setFormData({ ...formData, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        setMapPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const name = await getPlaceName(pos.coords.latitude, pos.coords.longitude);
        setFormPlaceName(name);
      });
    }
  };

  function LocationMarker() {
    useMapEvents({
      click: handleMapClick
    });
    return formData.location ? <Marker position={[formData.location.lat, formData.location.lng]} /> : null;
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.title || !formData.description || !formData.specialization || !formData.location) {
      setFormError('All fields except photo are required.');
      return;
    }
    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('specialization', formData.specialization);
      data.append('location', JSON.stringify({ type: 'Point', coordinates: [formData.location.lng, formData.location.lat] }));
      if (formData.photo) data.append('photo', formData.photo);
      await axios.post('http://localhost:4000/api/issues/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData({ title: '', description: '', specialization: '', location: null, photo: null });
      setShowForm(false);
      // Refresh complaints
      const response = await axios.get('http://localhost:4000/api/issues/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data);
    } catch (err) {
      setFormError('Failed to submit complaint.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>HelpHim</h1>
        </div>
        <div className="nav-user">
          <div className="user-info">
            <span className="user-avatar">{user?.username?.[0]?.toUpperCase()}</span>
            <span className="user-name">{user?.username}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="sidebar-menu">
            <button 
              className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="menu-icon">📊</span>
              Overview
            </button>
            <button 
              className={`menu-item ${activeTab === 'complaints' ? 'active' : ''}`}
              onClick={() => setActiveTab('complaints')}
            >
              <span className="menu-icon">📝</span>
              My Complaints
            </button>
          </div>
        </div>

        <main className="dashboard-main">
          {error && (
            <div className="dashboard-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Welcome back, {user?.username}!</h2>
              <p className="overview-subtitle">Here's an overview of your complaints</p>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h3>Total Complaints</h3>
                    <p className="stat-value">{stats.total}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <h3>Pending</h3>
                    <p className="stat-value">{stats.pending}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔄</div>
                  <div className="stat-info">
                    <h3>In Progress</h3>
                    <p className="stat-value">{stats.inProgress}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h3>Resolved</h3>
                    <p className="stat-value">{stats.resolved}</p>
                  </div>
                </div>
              </div>

              <div className="recent-complaints">
                <h3>Recent Complaints</h3>
                {complaints.length === 0 ? (
                  <div className="no-complaints">
                    <p>You haven't filed any complaints yet.</p>
                  </div>
                ) : (
                  <div className="complaints-list">
                    {complaints.slice(0, 5).map((complaint) => (
                      <div key={complaint._id} className="complaint-card">
                        <div className="complaint-header">
                          <h4>{complaint.title}</h4>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(complaint.status) }}
                          >
                            {complaint.status}
                          </span>
                        </div>
                        {complaint.photo && (
                          <img src={`http://localhost:4000${complaint.photo}`} alt={complaint.title} style={{width:'100%',maxHeight:'180px',objectFit:'cover',borderRadius:'8px',marginBottom:'0.5rem'}} />
                        )}
                        <p className="complaint-description">{complaint.description}</p>
                        <div className="complaint-footer">
                          <span className="complaint-date">
                            Filed on: {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                          <span className="complaint-location">
                            {complaintPlaces[complaint._id] ? `Location: ${complaintPlaces[complaint._id]}` : ''}
                          </span>
                          <button 
                            className="view-details-button"
                            onClick={() => navigate(`/complaint/${complaint._id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="complaints-section">
              <h2>My Complaints</h2>
              <button className="add-complaint-btn" onClick={() => setShowForm((v) => !v)}>
                {showForm ? 'Cancel' : 'Add Complaint'}
              </button>
              {showForm && (
                <form className="complaint-form" onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <select name="specialization" value={formData.specialization} onChange={handleFormChange} required>
                      <option value="">Select specialization</option>
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <button type="button" onClick={handleUseCurrentLocation} className="use-location-btn">Use Current Location</button>
                    <div style={{ height: '250px', marginTop: '1rem' }}>
                      <MapContainer center={[mapPosition.lat, mapPosition.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                      </MapContainer>
                    </div>
                    {formData.location && (
                      <div className="location-coords">Selected: {formPlaceName || (formData.location.lat.toFixed(5) + ', ' + formData.location.lng.toFixed(5))}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Photo (optional)</label>
                    <input type="file" name="photo" accept="image/*" onChange={handleFormChange} />
                  </div>
                  {formError && <div className="form-error">{formError}</div>}
                  <button type="submit" className="submit-btn" disabled={formLoading}>
                    {formLoading ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </form>
              )}
              {complaints.length === 0 ? (
                <div className="no-complaints">
                  <p>You haven't filed any complaints yet.</p>
                </div>
              ) : (
                <div className="complaints-grid">
                  {complaints.map((complaint) => (
                    <div key={complaint._id} className="complaint-card">
                      <div className="complaint-header">
                        <h4>{complaint.title}</h4>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(complaint.status) }}
                        >
                          {complaint.status}
                        </span>
                      </div>
                      {complaint.photo && (
                        <img src={`http://localhost:4000${complaint.photo}`} alt={complaint.title} style={{width:'100%',maxHeight:'180px',objectFit:'cover',borderRadius:'8px',marginBottom:'0.5rem'}} />
                      )}
                      <p className="complaint-description">{complaint.description}</p>
                      <div className="complaint-footer">
                        <span className="complaint-date">
                          Filed on: {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                        <span className="complaint-location">
                          {complaintPlaces[complaint._id] ? `Location: ${complaintPlaces[complaint._id]}` : ''}
                        </span>
                        <button 
                          className="view-details-button"
                          onClick={() => navigate(`/complaint/${complaint._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;