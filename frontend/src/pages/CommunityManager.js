import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CommunityManager = () => {
  const { user, switchCommunity } = useAuth();
  const [name, setName] = useState('');
  const [communityNumber, setCommunityNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/communities/create', { name });
      setSuccess(`Community "${response.data.name}" created! Code: ${response.data.communityNumber}`);
      setName('');
      // Refresh user data to show new community
      await switchCommunity(response.data._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('/communities/join', { communityNumber });
      setSuccess('Your request to join has been sent to the community creator. You will gain access once they approve it!');
      setCommunityNumber('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join community');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete the community "${name}"? \n\nThis will also delete all items listed in this community. This action cannot be undone.`)) {
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`/communities/${id}`);
        setSuccess(`Community "${name}" deleted.`);
        await switchCommunity(null); 
        window.location.reload(); 
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete community');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSwitch = async (id) => {
    const res = await switchCommunity(id);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  const handleLeave = async (id, name) => {
    if (window.confirm(`Are you sure you want to exit the community "${name}"? \n\nYou will no longer be able to see or share items in this group.`)) {
      setLoading(true);
      setError(null);
      try {
        await axios.post(`/communities/leave/${id}`);
        setSuccess(`You have left the community "${name}".`);
        await switchCommunity(null);
        window.location.reload();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to leave community');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="card max-w-600 mx-auto">
        <h2 className="mb-4">Community Manager</h2>
        
        {error && <div className="error-message mb-3">{error}</div>}
        {success && <div className="success-message mb-3" style={{color: 'var(--primary-gold)', fontWeight: 'bold'}}>{success}</div>}

        <div className="tabs mb-4">
          <section className="mb-5">
            <h3>Create a Community</h3>
            <p className="text-secondary small mb-3">Start your own sharing circle. You'll be the moderator.</p>
            <form onSubmit={handleCreate} className="d-flex gap-2">
              <input
                type="text"
                className="form-input"
                placeholder="Community Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Create
              </button>
            </form>
          </section>

          <hr className="my-5" />

          <section className="mb-5">
            <h3>Join a Community</h3>
            <p className="text-secondary small mb-3">Enter the 6-digit code shared by a community creator.</p>
            <form onSubmit={handleJoin} className="d-flex gap-2">
              <input
                type="text"
                className="form-input"
                placeholder="6-digit Code"
                value={communityNumber}
                onChange={(e) => setCommunityNumber(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-secondary" disabled={loading}>
                Join
              </button>
            </form>
          </section>

          <hr className="my-5" />

          <section>
            <h3>Your Communities</h3>
            <div className="mt-3">
              {user.communities && user.communities.length > 0 ? (
                user.communities.map((comm, index) => {
                  const currentUserId = user._id || user.id;
                  const creatorId = comm.creator?._id || comm.creator;
                  const isOwner = String(creatorId) === String(currentUserId);

                  return (
                    <div key={comm._id || index} className="item-row mb-3 d-flex justify-content-between align-items-center p-3 border rounded">
                      <div style={{flex: 1}}>
                        <div className="d-flex align-items-center mb-1">
                          <strong className="mr-2">{comm.name}</strong>
                          {isOwner && <span key="owner-badge" className="badge badge-secondary" style={{fontSize: '10px'}}>Owner</span>}
                        </div>
                        <span className="text-secondary small">Code: #{comm.communityNumber}</span>
                      </div>
                      
                      <div className="d-flex gap-2 align-items-center">
                        {user.activeCommunity === comm._id ? (
                          <span className="badge badge-primary">Active</span>
                        ) : (
                          <button onClick={() => handleSwitch(comm._id)} className="btn btn-outline btn-sm">
                            Switch
                          </button>
                        )}
                        
                        {isOwner ? (
                          <button 
                            onClick={() => handleDelete(comm._id, comm.name)} 
                            className="btn btn-outline btn-sm"
                            style={{borderColor: 'var(--error-red, #ff4d4f)', color: 'var(--error-red, #ff4d4f)'}}
                          >
                            Delete
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleLeave(comm._id, comm.name)} 
                            className="btn btn-outline btn-sm"
                          >
                            Exit
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-secondary">You haven't joined any communities yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CommunityManager;
