import React, { useEffect, useState } from 'react';
import { listVendors, createVendor } from '../api';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listVendors();
      setVendors(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const v = await createVendor({ name, email });
      setVendors((s) => [v, ...s]);
      setName('');
      setEmail('');
    } catch (err) {
      console.error(err);
      alert('Failed to create vendor');
    }
  }

  return (
    <div className="page">
      <h1>Vendors</h1>
      <form className="card" onSubmit={handleAdd}>
        <input className="input" placeholder="Vendor name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Vendor email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="actions">
          <button className="btn">Add vendor</button>
        </div>
      </form>

      <div className="card">
        <h3>All vendors</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="list">
            {vendors.map((v) => (
              <li key={v._id} className="list-item">
                <div>
                  <strong>{v.name}</strong>
                  <div className="muted">{v.email}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}