// src/api.js — simple fetch-based wrapper (browser-friendly)
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function request(path, opts = {}) {
  const url = `${BASE}${path}`;
  const headers = opts.headers || {};
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, { credentials: 'include', ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    let err;
    try {
      err = text ? JSON.parse(text) : { message: text || res.statusText };
    } catch (e) {
      err = { message: text || res.statusText };
    }
    const error = new Error(err.message || 'Request failed');
    error.status = res.status;
    error.payload = err;
    throw error;
  }
  // if no content (204) return null
  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export async function createRfp(text) {
  return request('/rfps', { method: 'POST', body: { text } });
}

export async function listVendors() {
  return request('/vendors', { method: 'GET' });
}

export async function createVendor(payload) {
  return request('/vendors', { method: 'POST', body: payload });
}

export async function sendRfp(rfpId, vendorIds) {
  return request(`/rfps/${rfpId}/send`, { method: 'POST', body: { vendorIds } });
}

export async function getRfp(rfpId) {
  return request(`/rfps/${rfpId}`, { method: 'GET' });
}

export async function compareRfp(rfpId) {
  return request(`/rfps/${rfpId}/compare`, { method: 'GET' });
}

export async function listProposals() {
  const res = await fetch('http://localhost:4000/proposals', { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function recommendRfp(rfpId) {
  return request(`/rfps/${rfpId}/recommend`, { method: 'POST' });
}