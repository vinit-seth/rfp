
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">AI RFP Manager</h1>
          <p className="hero-sub">
            Create RFPs in plain English, send them to vendors, automatically parse
            vendor responses using AI, and get recommendation-driven comparisons — all in one place.
          </p>

          <div className="hero-ctas">
            <Link to="/create" className="btn primary">Create RFP</Link>
            <Link to="/vendors" className="btn">Vendors</Link>
            <Link to="/proposals" className="btn">Proposals</Link>
          </div>

          <div className="hero-meta">
            <div className="meta-item">
              <strong>Create</strong>
              <span>Describe what you want to buy in natural language.</span>
            </div>
            <div className="meta-item">
              <strong>Send</strong>
              <span>Pick vendors and send the structured RFP over email.</span>
            </div>
            <div className="meta-item">
              <strong>Receive</strong>
              <span>Inbound replies parsed automatically into proposals.</span>
            </div>
            <div className="meta-item">
              <strong>Decide</strong>
              <span>AI ranks proposals to help you pick the best vendor.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Key features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Natural-language RFP creation</h3>
              <p>Write a simple description — the system will extract items, budget, timelines, and terms.</p>
            </div>

            <div className="feature-card">
              <h3>Vendor management</h3>
              <p>Keep a vendor master, manage contacts, and choose recipients for each RFP.</p>
            </div>

            <div className="feature-card">
              <h3>Automated parsing</h3>
              <p>Inbound vendor emails are parsed using AI to pull prices, delivery, and warranty details.</p>
            </div>

            <div className="feature-card">
              <h3>Recommendation engine</h3>
              <p>Compare proposals with scores and concise rationales to pick the best fit.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="container">
          <small>Built for the SDE assignment • Single-user demo • Replace API keys & env for production</small>
        </div>
      </footer>
    </div>
  );
}
