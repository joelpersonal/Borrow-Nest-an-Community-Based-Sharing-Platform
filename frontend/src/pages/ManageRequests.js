import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ManageRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/communities/total-requests');
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (communityId, userId, action) => {
    try {
      await axios.post('/communities/requests/respond', {
        communityId,
        userId,
        action
      });
      setRequests(requests.filter(req => !(req.user._id === userId && req.communityId === communityId)));
    } catch (err) {
      alert('Failed to process request');
    }
  };

  if (!user) return <div className="container py-5">Please login first.</div>;

  return (
    <div className="container py-5">
      <div className="card max-w-800 mx-auto">
        <h2 className="mb-4">Centralized Join Requests</h2>
        <p className="text-secondary mb-4">View and manage all requests for communities you've created.</p>

        {loading ? (
          <p>Loading requests...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : requests.length === 0 ? (
          <div className="empty-state text-center py-5">
            <h3 className="text-secondary">No pending requests</h3>
            <p>You're all caught up! New requests will appear here.</p>
          </div>
        ) : (
          <div className="request-list">
            {requests.map(req => (
              <div key={`${req.communityId}-${req.user._id}`} className="item-row mb-3 d-flex justify-content-between align-items-center p-3 border rounded">
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <h4 className="mb-0 mr-2">{req.user.name}</h4>
                    <span className="badge badge-secondary" style={{fontSize: '10px'}}>{req.communityName}</span>
                  </div>
                  <p className="text-secondary small mb-0">{req.user.email}</p>
                  <p className="text-secondary small mb-0">Requested: {new Date(req.requestedAt).toLocaleDateString()}</p>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    onClick={() => handleRespond(req.communityId, req.user._id, 'accept')}
                    className="btn btn-primary btn-sm"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleRespond(req.communityId, req.user._id, 'decline')}
                    className="btn btn-outline btn-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRequests;
