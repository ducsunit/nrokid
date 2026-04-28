'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, Server, Activity, Database, AlertCircle } from 'lucide-react';
import './globals.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.stats);
        } else {
          setError(json.error);
        }
      })
      .catch(err => setError('Failed to connect to the dashboard API.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }} className="animate-in delay-1">
        <h1 className="title">NRO Kid Command Center</h1>
        <p className="subtitle">Real-time server monitoring and configuration management</p>
      </header>

      {loading && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <Activity className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto', marginBottom: '16px' }} />
          <p>Initializing connection to server matrix...</p>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle color="#ef4444" />
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#ef4444' }}>Connection Error</h3>
              <p style={{ margin: 0, color: '#a1a1aa' }}>{error}</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#a1a1aa' }}>Ensure MySQL is running and the database 'nro_kid' exists.</p>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="dashboard-grid">
          {/* Quick Stats */}
          <div className="glass-panel animate-in delay-2 stat-card">
            <div className="stat-header">
              <span>Total Accounts</span>
              <Users size={20} color="var(--primary)" />
            </div>
            <div className="stat-value">{data.totalAccounts?.toLocaleString() || 0}</div>
            <div className="stat-label">Registered Players</div>
          </div>

          <div className="glass-panel animate-in delay-2 stat-card">
            <div className="stat-header">
              <span>Server Status</span>
              <Server size={20} color="#10b981" />
            </div>
            <div className="stat-value" style={{ color: '#10b981' }}>{data.config?.trangthai || 'Online'}</div>
            <div className="stat-label">Game Server Node</div>
          </div>

          <div className="glass-panel animate-in delay-2 stat-card">
            <div className="stat-header">
              <span>Current Project</span>
              <Database size={20} color="var(--secondary)" />
            </div>
            <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: '10px' }}>{data.config?.title || 'NRO Kid'}</div>
            <div className="stat-label">{data.config?.domain || 'localhost'}</div>
          </div>

          {/* Buffs Configuration */}
          <div className="glass-panel animate-in delay-3 data-table-container" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={24} color="var(--primary)" />
                  Global Attribute Rates (Buffs)
                </h2>
                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem' }}>Current active multipliers on the server.</p>
              </div>
              <button className="btn">Edit Rates</button>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Attribute Name (Buff)</th>
                  <th>Current Value (%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.buffs?.map((buff) => (
                  <tr key={buff.id}>
                    <td style={{ color: '#a1a1aa' }}>#{buff.id}</td>
                    <td>{buff.name.replace('#value', buff.value)}</td>
                    <td>
                      <span style={{ 
                        color: buff.value > 0 ? '#10b981' : '#a1a1aa',
                        fontWeight: buff.value > 0 ? '600' : '400'
                      }}>
                        +{buff.value}%
                      </span>
                    </td>
                    <td>
                      {buff.value > 0 ? (
                        <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Active</span>
                      ) : (
                        <span style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#a1a1aa', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Base</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!data.buffs || data.buffs.length === 0) && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#a1a1aa' }}>No attributes configured.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
