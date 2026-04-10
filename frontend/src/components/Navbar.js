import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requestCount, setRequestCount] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      fetchRequestCount();
      const interval = setInterval(fetchRequestCount, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchRequestCount = async () => {
    try {
      const res = await axios.get('/communities/total-requests');
      setRequestCount(res.data.length);
    } catch (err) {
      console.error('Failed to fetch request count');
    }
  };

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Borrow Nest
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          <Link to="/ai-search" className="navbar-link">
            AI Search
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
               <Link to="/add-item" className="navbar-link">
                Add Item
              </Link>
              <Link to="/communities" className="navbar-link">
                Communities
              </Link>
              <div className="navbar-user">
                <Link to="/profile" className="user-avatar-link">
                  <div className="user-avatar">
                    {getUserInitials(user.name)}
                  </div>
                </Link>
                <Link to="/profile" className="user-info-text-link">
                  <div className="user-info-text">
                    <span className="user-name">Hi, {user.name.split(' ')[0]}</span>
                    {user.activeCommunity && (
                      <span className="community-badge">
                        {user.communities?.find(c => c._id === user.activeCommunity)?.name || 'Community'}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="navbar-actions">
                  <Link to="/manage-requests" className="request-link" title="Manage Requests">
                    🔔
                    {requestCount > 0 && <span className="notification-badge">{requestCount}</span>}
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline btn-sm">
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;