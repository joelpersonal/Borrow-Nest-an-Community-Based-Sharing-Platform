import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, updateLocation } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, request: null });

  useEffect(() => {
    fetchDashboardData();
  }, [user?.activeCommunity]);

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

  const handlePaymentProcess = async (e) => {
    e.preventDefault();
    try {
      const actualDuration = paymentModal.request.borrowDuration || paymentModal.request.borrowDays;
      const calculatedCost = (paymentModal.request.item.pricePerDay || 0) * actualDuration;
      await axios.put(`/borrow/${paymentModal.request._id}/pay`, { totalCost: calculatedCost });
      fetchDashboardData(); 
      setPaymentModal({ isOpen: false, request: null });
      alert('Payment processed successfully! Your request is now Paid.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing payment');
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

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;
        const res = await updateLocation(longitude, latitude);
        if (res.success) {
          alert('Location updated successfully! You can now post and search for general local items.');
        } else {
          alert(res.message);
        }
      },
      (error) => {
        alert('Unable to retrieve your location. Please ensure location access is allowed in your browser settings.');
      }
    );
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
        <div>
          <h1>Welcome back, {user.name}!</h1>
          {(!user.location || !user.location.coordinates || user.location.coordinates.length < 2) && (
            <div className="location-prompt" style={{ marginTop: '10px', background: '#e0f7fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #00acc1' }}>
              <p style={{ margin: 0, marginBottom: '10px', color: '#006064' }}>
                📍 <strong>Tip:</strong> Share your location to see and post items in your local 2km radius without needing a community.
              </p>
              <button 
                onClick={handleShareLocation}
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: '#00acc1', color: 'white', border: 'none' }}
              >
                Share My Location
              </button>
            </div>
          )}
        </div>
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
              <h2 className="card-title">My Active Borrow Requests ({myRequests.filter(r => ['Requested', 'Approved', 'Paid'].includes(r.status)).length})</h2>
            </div>
            {myRequests.filter(r => ['Requested', 'Approved', 'Paid'].includes(r.status)).length === 0 ? (
              <p>You haven't made any active borrow requests.</p>
            ) : (
              <div className="requests-list">
                {myRequests.filter(r => ['Requested', 'Approved', 'Paid'].includes(r.status)).map(request => (
                  <div key={request._id} className="request-row">
                    <div className="request-info">
                      <h4>{request.item.title}</h4>
                      <p>Owner: {request.owner.name}</p>
                      <p>Duration: {request.borrowDuration || request.borrowDays} {request.durationType || 'days'}</p>
                    </div>
                    <span className={`status-badge status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                    <div className="request-actions">
                      {request.status === 'Approved' && (
                        <button 
                          onClick={() => setPaymentModal({ isOpen: true, request })}
                          className="btn btn-primary btn-sm mx-1"
                        >
                          Pay Now
                        </button>
                      )}
                      {request.status === 'Paid' && (
                        <button 
                          onClick={() => handleStatusUpdate(request._id, 'Returned')}
                          className="btn btn-success btn-sm mx-1"
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

        {/* Received Requests */}
        <section className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Active Requests for My Items ({receivedRequests.filter(r => ['Requested', 'Approved', 'Paid'].includes(r.status)).length})</h2>
            </div>
            {receivedRequests.filter(r => ['Requested', 'Approved', 'Paid'].includes(r.status)).length === 0 ? (
              <p>No active requests to borrow your items.</p>
            ) : (
              <div className="requests-list">
                {receivedRequests.filter(r => ['Requested', 'Approved', 'Paid'].includes(r.status)).map(request => (
                  <div key={request._id} className="request-row">
                    <div className="request-info">
                      <h4>{request.item.title}</h4>
                      <p>Requested by: {request.borrower.name}</p>
                      <p>Duration: {request.borrowDuration || request.borrowDays} {request.durationType || 'days'}</p>
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
                      {['Approved', 'Paid'].includes(request.status) && (
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

        {/* Transaction History */}
        <section className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Transaction History</h2>
            </div>
            {myRequests.filter(r => ['Returned', 'Rejected'].includes(r.status)).length === 0 && 
             receivedRequests.filter(r => ['Returned', 'Rejected'].includes(r.status)).length === 0 ? (
              <p>No past transactions.</p>
            ) : (
              <div className="requests-list">
                {[
                  ...myRequests.filter(r => ['Returned', 'Rejected'].includes(r.status)).map(r => ({ ...r, role: 'Borrower' })),
                  ...receivedRequests.filter(r => ['Returned', 'Rejected'].includes(r.status)).map(r => ({ ...r, role: 'Owner' }))
                ].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)).map(request => (
                  <div key={request._id} className="request-row" style={{ opacity: 0.8 }}>
                    <div className="request-info">
                      <h4>{request.item.title} <span style={{ fontSize: '0.8rem', color: '#666' }}>({request.role})</span></h4>
                      <p>{request.role === 'Borrower' ? `Owner: ${request.owner.name}` : `Borrower: ${request.borrower.name}`}</p>
                      <p>Date: {new Date(request.requestDate).toLocaleDateString()}</p>
                    </div>
                    <div className="request-actions">
                      <span className={`status-badge status-${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {paymentModal.isOpen && paymentModal.request && (
        <div className="modal-overlay" onClick={() => setPaymentModal({ isOpen: false, request: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h3>Process Payment</h3>
                <p className="modal-item-name">"{paymentModal.request.item.title}"</p>
              </div>
              <button onClick={() => setPaymentModal({ isOpen: false, request: null })} className="modal-close">×</button>
            </div>
            <form onSubmit={handlePaymentProcess} className="borrow-form">
              <div className="borrow-summary" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Total Amount Due: <strong>₹{(paymentModal.request.item.pricePerDay || 0) * (paymentModal.request.borrowDuration || paymentModal.request.borrowDays)}</strong></p>
                
                <h4 style={{ margin: '15px 0 5px 0', fontSize: '1rem', color: '#555' }}>Owner's Payment Details:</h4>
                {paymentModal.request.owner.bankDetails?.upiId || paymentModal.request.owner.bankDetails?.bankName ? (
                  <>
                    {paymentModal.request.owner.bankDetails?.upiId && <div><strong>UPI ID:</strong> {paymentModal.request.owner.bankDetails.upiId}</div>}
                    {paymentModal.request.owner.bankDetails?.bankName && (
                      <div style={{ marginTop: '5px' }}>
                        <div><strong>Bank:</strong> {paymentModal.request.owner.bankDetails.bankName}</div>
                        <div><strong>A/C:</strong> {paymentModal.request.owner.bankDetails.accountNumber}</div>
                        <div><strong>IFSC:</strong> {paymentModal.request.owner.bankDetails.ifscCode}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#d32f2f', margin: 0 }}>The owner has not provided bank details. Please contact them directly.</p>
                )}
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setPaymentModal({ isOpen: false, request: null })} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}>I Have Completed Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;