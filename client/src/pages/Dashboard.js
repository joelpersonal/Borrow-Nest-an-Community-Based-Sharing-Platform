import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [itemsRes, requestsRes, receivedRes] = await Promise.all([
        axios.get('/items/my-items'),
        axios.get('/borrow/my-requests'),
        axios.get('/borrow/received-requests')
      ]);

      setMyItems(itemsRes.data);
      setMyRequests(requestsRes.data);
      setReceivedRequests(receivedRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await axios.put(`/borrow/${requestId}/status`, { status });
      fetchDashboardData(); // Refresh data
      alert(`Request ${status.toLowerCase()} successfully!`);
    } catch (error) {
      alert('Error updating request status');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/items/${itemId}`);
        fetchDashboardData(); // Refresh data
        alert('Item deleted successfully!');
      } catch (error) {
        alert('Error deleting item');
      }
    }
  };

  if (loading) {
    return (
      <div className="container text-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}! 👋</h1>
        <Link to="/add-item" className="btn btn-primary">
          Add New Item
        </Link>
      </div>

      <div className="dashboard-grid">
        {/* My Items */}
        <section className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Items ({myItems.length})</h2>
            </div>
            {myItems.length === 0 ? (
              <p>You haven't added any items yet.</p>
            ) : (
              <div className="items-list">
                {myItems.map(item => (
                  <div key={item._id} className="item-row">
                    <div className="item-info">
                      <h4>{item.title}</h4>
                      <p>{item.category}</p>
                      <span className={`availability-badge ${item.available ? 'available' : 'unavailable'}`}>
                        {item.available ? 'Available' : 'Borrowed'}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* My Borrow Requests */}
        <section className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Borrow Requests ({myRequests.length})</h2>
            </div>
            {myRequests.length === 0 ? (
              <p>You haven't made any borrow requests yet.</p>
            ) : (
              <div className="requests-list">
                {myRequests.map(request => (
                  <div key={request._id} className="request-row">
                    <div className="request-info">
                      <h4>{request.item.title}</h4>
                      <p>Owner: {request.owner.name}</p>
                      <p>Days: {request.borrowDays}</p>
                    </div>
                    <span className={`status-badge status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                    {request.status === 'Approved' && (
                      <button 
                        onClick={() => handleStatusUpdate(request._id, 'Returned')}
                        className="btn btn-success btn-sm"
                      >
                        Mark as Returned
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Received Requests */}
        <section className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Requests for My Items ({receivedRequests.length})</h2>
            </div>
            {receivedRequests.length === 0 ? (
              <p>No one has requested to borrow your items yet.</p>
            ) : (
              <div className="requests-list">
                {receivedRequests.map(request => (
                  <div key={request._id} className="request-row">
                    <div className="request-info">
                      <h4>{request.item.title}</h4>
                      <p>Requested by: {request.borrower.name}</p>
                      <p>Days: {request.borrowDays}</p>
                      {request.message && <p>Message: "{request.message}"</p>}
                    </div>
                    <div className="request-actions">
                      <span className={`status-badge status-${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                      {request.status === 'Requested' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(request._id, 'Approved')}
                            className="btn btn-success btn-sm"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                            className="btn btn-danger btn-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'Approved' && (
                        <button 
                          onClick={() => handleStatusUpdate(request._id, 'Returned')}
                          className="btn btn-primary btn-sm"
                        >
                          Mark as Returned
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;