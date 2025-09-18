// admin/Phase2UnlockPanel.jsx
// React component for Phase 2 unlock administration
// Deploy behind SSO protection - do not expose publicly

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Phase2UnlockPanel({ apiBase = process.env.REACT_APP_API_BASE || '/api' }) {
  const [status, setStatus] = useState(null);
  const [downloads, setDownloads] = useState(0);
  const [approvals, setApprovals] = useState(0);
  const [message, setMessage] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => fetchStatus(), []);

  async function fetchStatus() {
    try {
      setLoading(true);
      const r = await axios.get(`${apiBase}/phase2/status`);
      setStatus(r.data);
      setDownloads(r.data.downloads || 0);
      setMessage(`Status updated: ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      console.error(e);
      setMessage('Error fetching status: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function requestUnlock() {
    if (!adminToken.trim()) {
      setMessage('Admin token required');
      return;
    }
    
    try {
      setLoading(true);
      const r = await axios.post(`${apiBase}/phase2/unlock`, { adminToken });
      setMessage(`Unlock response:\n${JSON.stringify(r.data, null, 2)}`);
      fetchStatus();
    } catch (e) {
      setMessage(`Error: ${e.response?.data?.error || e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function checkFlag() {
    try {
      const r = await axios.get(`${apiBase}/phase2/flag`);
      setMessage(`Flag status:\n${JSON.stringify(r.data, null, 2)}`);
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    }
  }

  const downloadTarget = Number(process.env.REACT_APP_DOWNLOAD_TARGET || 1_000_000);
  const progressPercent = Math.min((downloads / downloadTarget) * 100, 100);

  return (
    <div style={{ 
      padding: 24, 
      fontFamily: 'Inter, system-ui, Arial', 
      maxWidth: 600,
      background: '#f8fafc',
      borderRadius: 8,
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{ color: '#1e293b', marginBottom: 20 }}>🔒 Phase 2 Unlock Administration</h2>
      
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#374151', marginBottom: 8 }}>Download Progress</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span><strong>{downloads.toLocaleString()}</strong> / {downloadTarget.toLocaleString()}</span>
          <div style={{ 
            flex: 1, 
            height: 8, 
            background: '#e5e7eb', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: progressPercent >= 100 ? '#10b981' : '#3b82f6',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {progressPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#374151', marginBottom: 8 }}>Unlock Status</h3>
        <div style={{ 
          padding: 12, 
          borderRadius: 6,
          background: status?.unlocked ? '#dcfce7' : '#fef3c7',
          color: status?.unlocked ? '#166534' : '#92400e',
          fontWeight: 'bold'
        }}>
          {status?.unlocked ? '✅ PHASE 2 UNLOCKED' : '🔒 PHASE 2 LOCKED'}
        </div>
      </div>

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <h3 style={{ color: '#374151', marginBottom: 8 }}>Manual Unlock</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input 
            type="password"
            placeholder="Admin token" 
            value={adminToken} 
            onChange={e => setAdminToken(e.target.value)} 
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #d1d5db',
              borderRadius: 4,
              flex: 1
            }} 
          />
          <button 
            onClick={requestUnlock} 
            disabled={loading}
            style={{ 
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Processing...' : 'Request Unlock'}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={checkFlag} 
            style={{ 
              padding: '6px 12px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Check Flag
          </button>
          <button 
            onClick={fetchStatus} 
            style={{ 
              padding: '6px 12px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Refresh Status
          </button>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
        <strong>Note:</strong> Manual unlock requires {process.env.REACT_APP_REQUIRED_APPROVALS || 2} admin approvals. 
        Tokens are anonymous for security.
      </div>

      {message && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ color: '#374151', marginBottom: 8 }}>Response:</h4>
          <pre style={{ 
            background: '#1f2937', 
            color: '#10b981', 
            padding: 12, 
            borderRadius: 4,
            fontSize: 12,
            overflow: 'auto',
            maxHeight: 200
          }}>
            {message}
          </pre>
        </div>
      )}
    </div>
  );
}