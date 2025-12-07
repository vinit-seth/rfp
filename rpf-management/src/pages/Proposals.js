// src/pages/Proposals.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProposals } from '../api'; 

export default function Proposals() {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await listProposals();
        // ensure an array
        if (!Array.isArray(res)) {
          console.warn('Expected proposals array, got:', res);
          setProposals([]);
        } else {
          if (mounted) setProposals(res);
        }
      } catch (e) {
        console.error('Failed to load proposals', e);
        setErr('Failed to load proposals');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="page"><h2>Loading proposals…</h2></div>;
  if (err) return <div className="page"><h2>{err}</h2></div>;
  if (!proposals.length) return <div className="page"><h2>No proposals yet</h2></div>;

  return (
    <div className="page">
      <h1>Proposals</h1>
      <ul className="proposals-list" style={{ listStyle: 'none', padding: 0 }}>
        {proposals.map((p) => {
          // rfp may be an object or an id string
          const rfpObj = p.rfp && typeof p.rfp === 'object' ? p.rfp : null;
          const rfpId = rfpObj ? (rfpObj._id || rfpObj.id) : (typeof p.rfp === 'string' ? p.rfp : null);
          const rfpTitle = rfpObj ? (rfpObj.title || rfpObj._id) : (p.rfp_title || 'Unknown RFP');

          return (
            <li key={p._id} style={{ marginBottom: 18, background:'#fff', padding:16, borderRadius:8, boxShadow:'0 0 0 1px #eee inset' }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                    <strong style={{ fontSize:16 }}>{p.vendorName || 'Unknown vendor'}</strong>
                    <span style={{ color:'#666' }}>— {typeof p.total === 'number' ? `₹${p.total}` : (p.total ?? '—')}</span>
                  </div>

                  <div style={{ marginTop:6, color:'#777' }}>
                    <small>RFP: {rfpTitle}</small>
                  </div>

                  <div style={{ marginTop:12 }}>
                    {Array.isArray(p.items) && p.items.length ? (
                      p.items.slice(0,3).map((it, idx) => (
                        <div key={idx} style={{ fontSize:13, color:'#333' }}>
                          • {it.name || 'item'} — qty: {it.qty ?? 1} — {it.totalPrice ?? it.unitPrice ?? '—'}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize:13, color:'#999' }}>No line items parsed</div>
                    )}
                  </div>
                </div>

                <div style={{ minWidth:120, textAlign:'right' }}>
                  {rfpId ? (
                    <Link to={`/rfps/${rfpId}`} className="btn">View RFP</Link>
                  ) : (
                    <button className="btn" disabled>View RFP</button>
                  )}
                  <div style={{ marginTop:8, fontSize:12, color:'#999' }}>{new Date(p.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}