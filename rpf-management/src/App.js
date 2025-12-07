// src/App.js (copy/paste or make sure equivalent exists)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateRfp from './pages/CreateRfp';
import Vendors from './pages/Vendors';
import Proposals from './pages/Proposals';
import RfpDetail from './pages/RfpDetail';
import Home from './pages/Home';

export default function App() {
  return (
    <Router>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand">AI RFP Manager</Link>
          <nav>
            <Link to="/create">Create</Link> | <Link to="/vendors">Vendors</Link> | <Link to="/proposals">Proposals</Link>
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRfp />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/rfps/:id" element={<RfpDetail />} />
        </Routes>
      </main>
    </Router>
  );
}
