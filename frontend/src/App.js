import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import StockManagement from './pages/StockManagement';
import DistributionsOverview from './pages/DistributionsOverview';
import Messes from './pages/Messes';
import Reports from './pages/Reports';
import AddStock from './pages/AddStock';
import DistributeStock from './pages/DistributeStock';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

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
      case 'reports':
        return <Reports onNavigate={setCurrentPage} />;
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
        <h1>Sales & Distribution Management</h1>

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
                className={currentPage === 'reports' ? 'active' : ''}
                onClick={() => setCurrentPage('reports')}
              >
                📈 Reports
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
