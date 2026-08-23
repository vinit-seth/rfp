import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRfps } from '../api';

export default function Rfps() {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await listRfps();
        if (mounted) setRfps(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load RFPs', err);
        if (mounted) setError('Failed to load RFPs');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="page"><h1>Loading RFPs...</h1></div>;
  if (error) return <div className="page"><h1>{error}</h1></div>;

  return (
    <div className="page">
      <h1>All RFPs</h1>

      {rfps.length === 0 ? (
        <div className="card">
          <p>No RFPs yet. Create one from the natural-language form.</p>
        </div>
      ) : (
        <ul className="list" style={{ listStyle: 'none', padding: 0 }}>
          {rfps.map((rfp) => (
            <li key={rfp._id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px' }}>{rfp.title}</h3>
                  <div className="muted">Budget: {rfp.budget ?? '—'}</div>
                  <div className="muted">Delivery: {rfp.deliveryDays ? `${rfp.deliveryDays} days` : '—'}</div>
                  <div className="muted">Payment: {rfp.paymentTerms ?? '—'}</div>
                </div>
                <Link to={`/rfps/${rfp._id}`} className="btn">Open</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
