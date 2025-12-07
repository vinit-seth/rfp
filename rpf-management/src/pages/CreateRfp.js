import React, { useState } from "react";
import { createRfp } from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreateRfp() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await createRfp(text);
      setResult(data.structuredRfp || data);
      // navigate to rfp detail if id present
      if (data.id) navigate(`/rfps/${data.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create RFP — check console");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Create RFP</h1>
      <form onSubmit={handleCreate} className="card">
        <textarea
          className="input textarea"
          placeholder="Describe what you need (e.g., 10 laptops, 16GB RAM, 14-inch)"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Parsing…" : "Create RFP"}
          </button>
        </div>
      </form>

      {result && (
        <div className="card">
          <h3>Structured RFP</h3>
          <pre className="mono">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
