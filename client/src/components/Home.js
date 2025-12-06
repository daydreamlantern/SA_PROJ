import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ 
    reason: '', 
    start_date: '', 
    end_date: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get('/api/leave-requests');
      setLeaveRequests(response.data);
    } catch (err) {
      setError('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await axios.post('/api/leave-requests', formData);
      setFormData({ reason: '', start_date: '', end_date: '' });
      fetchLeaveRequests();
      alert('Leave request submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/leave-requests/${id}`, { status });
      fetchLeaveRequests();
      alert(`Leave request ${status} successfully!`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update request status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return '#4caf50';
      case 'denied':
        return '#f44336';
      default:
        return '#ff9800';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>Employee Leave Request System</h1>
          <div className="user-info">
            <span>Welcome, {user?.name} ({user?.role})</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="home-content">
        {error && <div className="error-message">{error}</div>}

        {user?.role === 'employee' && (
          <div className="request-form-section">
            <h2>Submit Leave Request</h2>
            <form onSubmit={handleSubmitRequest} className="request-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={user.name} disabled />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" value={user.department} disabled />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Reason for Leave *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  rows="4"
                  placeholder="Enter the reason for your leave request"
                />
              </div>
              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}

        <div className="requests-section">
          <h2>
            {user?.role === 'admin' ? 'All Leave Requests' : 'My Leave Requests'}
          </h2>
          {leaveRequests.length === 0 ? (
            <div className="no-requests">No leave requests found</div>
          ) : (
            <div className="requests-list">
              {leaveRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.name}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(request.status) }}
                    >
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="request-details">
                    <p><strong>Department:</strong> {request.department}</p>
                    <p><strong>Email:</strong> {request.email}</p>
                    <p><strong>Leave Dates:</strong> {
                      request.start_date && request.end_date 
                        ? request.start_date === request.end_date
                          ? new Date(request.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : `${new Date(request.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date(request.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                        : 'Not specified'
                    }</p>
                    <p><strong>Reason:</strong> {request.reason}</p>
                    <p><strong>Submitted:</strong> {new Date(request.created_at).toLocaleString()}</p>
                  </div>
                  {user?.role === 'admin' && request.status === 'pending' && (
                    <div className="request-actions">
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'accepted')}
                        className="accept-btn"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'denied')}
                        className="deny-btn"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

