import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRfp, listVendors, sendRfp, compareRfp, recommendRfp } from '../api';

export default function RfpDetail() {
  const { id } = useParams();                     // route param — use this for API calls
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // reload when `id` changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) {
      console.warn('No RFP id in route');
      return;
    }
    setLoading(true);
    try {
      const [r, vs] = await Promise.all([getRfp(id), listVendors()]);
      // Defensive: if the API wraps r within an object, handle both shapes
      const actualRfp = r?.rfp ?? r;
      setRfp(actualRfp);
      setVendors(Array.isArray(vs) ? vs : (vs?.vendors ?? []));
    } catch (err) {
      console.error('Failed to load RFP or vendors', err);
      alert('Failed to load RFP / vendors. See console for details.');
    } finally {
      setLoading(false);
    }
  }

  function toggle(vIdRaw) {
    // ensure string form because some IDs can be ObjectId objects (safety)
    const vId = String(vIdRaw);
    const s = new Set(selected);
    if (s.has(vId)) s.delete(vId);
    else s.add(vId);
    setSelected(s);
  }

  async function handleSend() {
    // use route param `id` — safer than reading rfp._id (avoids undefined)
    const rfpId = id || rfp?._id;
    if (!rfpId) {
      return alert('RFP id missing. Cannot send.');
    }

    const arr = Array.from(selected);
    if (arr.length === 0) return alert('Pick at least one vendor');

    setSending(true);
    try {
      // sendRfp should accept (rfpId, vendorsArray)
      await sendRfp(rfpId, arr);
      alert('RFP sent to selected vendors');
    } catch (err) {
      console.error('sendRfp failed', err);
      alert('Failed to send — check server logs.');
    } finally {
      setSending(false);
    }
  }

  async function handleCompare() {
    if (!id) return alert('Missing RFP id');
    try {
      const res = await compareRfp(id);
      setComparison(res);
    } catch (err) {
      console.error('compareRfp failed', err);
      alert('Compare failed');
    }
  }

  async function handleRecommend() {
    if (!id) return alert('Missing RFP id');
    setRecLoading(true);
    try {
      const res = await recommendRfp(id);
      setRecommendation(res);
    } catch (err) {
      console.error('recommendRfp failed', err);
      alert('Recommendation failed');
    } finally {
      setRecLoading(false);
    }
  }

  if (loading) return <div className="page"><h1>Loading...</h1></div>;
  if (!rfp) return <div className="page"><h1>No RFP found</h1></div>;

  return (
    <div className="page">
      <h1>RFP: {rfp.title || rfp._id}</h1>

      <div className="card">
        <h3>Details</h3>
        <pre className="mono">{JSON.stringify(rfp, null, 2)}</pre>
      </div>

      <div className="card">
        <h3>Send to vendors</h3>

        <div className="vendor-grid">
          {vendors.length === 0 && <div className="muted">No vendors yet</div>}
          {vendors.map(v => {
            const vId = String(v._id || v.id || v.email || v.name);
            return (
              <label key={vId} className="vendor-item" style={{ display: 'inline-block', marginRight: 12 }}>
                <input
                  type="checkbox"
                  checked={selected.has(vId)}
                  onChange={() => toggle(vId)}
                  style={{ marginRight: 8 }}
                />
                <div style={{ display: 'inline-block' }}>
                  <strong>{v.name}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>{v.email}</div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="actions" style={{ marginTop: 12 }}>
          <button
            className="btn"
            onClick={handleSend}
            disabled={sending || !id}
          >
            {sending ? 'Sending...' : 'Send RFP'}
          </button>

          <button className="btn" onClick={handleCompare} style={{ marginLeft: 8 }}>
            Compare proposals
          </button>

          <button
            className="btn"
            onClick={handleRecommend}
            style={{ marginLeft: 8 }}
            disabled={recLoading}
          >
            {recLoading ? 'Thinking...' : 'Recommend Vendor'}
          </button>
        </div>
      </div>

      {comparison && (
        <div className="card">
          <h3>Comparison</h3>
          <pre className="mono">{JSON.stringify(comparison, null, 2)}</pre>
        </div>
      )}

      {recommendation && (
        <div className="card">
          <h3>AI Recommendation</h3>
          <pre className="mono">{JSON.stringify(recommendation, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}