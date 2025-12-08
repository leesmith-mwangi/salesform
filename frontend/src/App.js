import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockManagement from './pages/StockManagement';
import DistributionsOverview from './pages/DistributionsOverview';
import Messes from './pages/Messes';
import Reports from './pages/Reports';
import AddStock from './pages/AddStock';
import DistributeStock from './pages/DistributeStock';
import MessFinancials from './pages/MessFinancials';
import ProfitAnalysis from './pages/ProfitAnalysis';
import ChangePassword from './pages/ChangePassword';
import ProductManagement from './pages/ProductManagement';
import { verifyToken } from './services/api';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        // Verify token is still valid
        await verifyToken();
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'stock':
        return <StockManagement onNavigate={setCurrentPage} />;
      case 'distributions':
        return <DistributionsOverview onNavigate={setCurrentPage} />;
      case 'messes':
        return <Messes onNavigate={setCurrentPage} />;
      case 'financials':
        return <MessFinancials onNavigate={setCurrentPage} />;
      case 'reports':
        return <Reports onNavigate={setCurrentPage} />;
      case 'profit':
        return <ProfitAnalysis onNavigate={setCurrentPage} />;
      case 'changePassword':
        return <ChangePassword />;
      case 'productManagement':
        return <ProductManagement />;
      case 'addStock':
        return <AddStock />;
      case 'distribute':
        return <DistributeStock />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      <nav className="nav">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>Sales & Distribution Management</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              textAlign: 'right',
              fontSize: '0.9rem',
              color: '#fff',
              opacity: 0.9
            }}>
              <div style={{ fontWeight: '500' }}>{user?.full_name || user?.username}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {user?.role === 'admin' ? '👑 Admin' : user?.role === 'manager' ? '👔 Manager' : '👤 User'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="nav-container">
          {/* View Pages */}
          <div className="nav-section">
            <div className="nav-section-label">View</div>
            <div className="nav-links">
              <button
                className={currentPage === 'dashboard' ? 'active' : ''}
                onClick={() => setCurrentPage('dashboard')}
              >
                🏠 Dashboard
              </button>
              <button
                className={currentPage === 'stock' ? 'active' : ''}
                onClick={() => setCurrentPage('stock')}
              >
                📦 Stock
              </button>
              <button
                className={currentPage === 'distributions' ? 'active' : ''}
                onClick={() => setCurrentPage('distributions')}
              >
                📊 Distributions
              </button>
              <button
                className={currentPage === 'messes' ? 'active' : ''}
                onClick={() => setCurrentPage('messes')}
              >
                🏢 Messes
              </button>
              <button
                className={currentPage === 'financials' ? 'active' : ''}
                onClick={() => setCurrentPage('financials')}
              >
                💰 Financials
              </button>
              <button
                className={currentPage === 'reports' ? 'active' : ''}
                onClick={() => setCurrentPage('reports')}
              >
                📈 Reports
              </button>
              <button
                className={currentPage === 'profit' ? 'active' : ''}
                onClick={() => setCurrentPage('profit')}
              >
                💰 Profit Analysis
              </button>
            </div>
          </div>

          {/* Management Section */}
          <div className="nav-section">
            <div className="nav-section-label">Management</div>
            <div className="nav-links">
              <button
                className={currentPage === 'productManagement' ? 'active' : ''}
                onClick={() => setCurrentPage('productManagement')}
              >
                🛍️ Manage Products
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div className="nav-section">
            <div className="nav-section-label">Account</div>
            <div className="nav-links">
              <button
                className={currentPage === 'changePassword' ? 'active' : ''}
                onClick={() => setCurrentPage('changePassword')}
              >
                🔐 Change Password
              </button>
            </div>
          </div>

          {/* Action Pages */}
          <div className="nav-section">
            <div className="nav-section-label">Actions</div>
            <div className="nav-links">
              <button
                className={`btn-nav-action ${currentPage === 'addStock' ? 'active' : ''}`}
                onClick={() => setCurrentPage('addStock')}
              >
                + Add Stock
              </button>
              <button
                className={`btn-nav-action ${currentPage === 'distribute' ? 'active' : ''}`}
                onClick={() => setCurrentPage('distribute')}
              >
                📤 Distribute
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
