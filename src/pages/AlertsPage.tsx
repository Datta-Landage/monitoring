import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Search, ChevronRight } from 'lucide-react';
import { monitorService } from '../services/api';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      const data = await monitorService.getAlerts();
      setAlerts(data);
      setLoading(false);
    };
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(alert => 
    !alert.resolved && (
      alert.outletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.errorMessage.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return (
    <div className="flex justify-center items-center" style={{ height: '60vh' }}>
      <div className="animate-pulse flex-col items-center gap-4">
        <div className="status-indicator status-blue" style={{ width: 16, height: 16 }}></div>
        <span style={{ fontWeight: 800, letterSpacing: '2px', color: 'var(--color-blue)', fontSize: '0.9rem' }}>LOADING INCIDENTS...</span>
      </div>
    </div>
  );

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="flex items-center gap-4" style={{ fontSize: '3.2rem' }}>
            <AlertTriangle color="var(--color-red)" size={48} style={{ filter: 'drop-shadow(0 0 15px hsla(0, 100%, 60%, 0.3))' }} />
            Incident Feed
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.1rem', marginTop: '0.5rem' }}>Real-time synchronization fault matrix across the fleet</p>
        </div>
        
        <div className="flex gap-4">
          <div className="sub-surface flex items-center gap-3 px-6 py-3" style={{ border: '1px solid var(--border-color)' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="FILTER_STREAM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '250px', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      <div className="flex-col gap-6">
        {filteredAlerts.length === 0 ? (
          <div className="surface flex-col items-center gap-6 py-20" style={{ textAlign: 'center' }}>
            <div style={{ padding: '2rem', background: 'hsla(150, 100%, 50%, 0.05)', borderRadius: '50%', border: '1px solid hsla(150, 100%, 50%, 0.1)' }}>
              <CheckCircle2 size={64} color="var(--color-green)" style={{ filter: 'drop-shadow(0 0 20px hsla(150, 100%, 50%, 0.3))' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>SYSTEM_NOMINAL</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>No active synchronization faults detected in the current matrix.</p>
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div 
              key={alert._id} 
              className="surface flex flex-col p-0 overflow-hidden mb-6"
              style={{ 
                borderColor: alert.resolved ? 'var(--border-color)' : 'hsla(0, 100%, 60%, 0.2)',
                background: expandedAlertId === alert._id ? 'hsla(0, 0%, 100%, 0.02)' : 'var(--bg-surface)'
              }}
            >
              <div className="flex items-center gap-8 px-8 py-6" style={{ flex: 1 }}>
                {/* Visual Accent */}
                <div style={{ 
                  width: '4px', height: '40px',
                  background: alert.resolved ? 'var(--color-green)' : 'var(--color-red)',
                  borderRadius: '2px',
                  boxShadow: alert.resolved ? '0 0 10px hsla(150, 100%, 50%, 0.4)' : '0 0 10px hsla(0, 100%, 60%, 0.4)'
                }}></div>

                <div className="flex-col" style={{ width: '220px' }}>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{alert.outletName}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: '0.2rem' }}>{new Date(alert.timestamp).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-4" style={{ width: '180px' }}>
                   <div style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: alert.direction === 'PUSH' ? 'hsla(30, 100%, 60%, 0.1)' : 'hsla(210, 100%, 60%, 0.1)', border: '1px solid hsla(0,0%,100%,0.05)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', color: alert.direction === 'PUSH' ? 'var(--color-yellow)' : 'var(--color-blue)' }}>
                     {alert.direction}
                   </div>
                   <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{alert.tableName}</span>
                </div>

                <div style={{ flex: 1 }}>
                   <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.5 }}>{alert.errorMessage}</p>
                </div>

                <div className="flex items-center gap-4">
                   <button 
                     className="nav-link active"
                     style={{ fontSize: '0.8rem', padding: '0.6rem 1.25rem', background: expandedAlertId === alert._id ? 'var(--color-blue)' : 'rgba(255,255,255,0.05)', color: expandedAlertId === alert._id ? 'white' : 'var(--text-primary)' }}
                     onClick={() => setExpandedAlertId(expandedAlertId === alert._id ? null : alert._id)}
                   >
                     {expandedAlertId === alert._id ? 'COLLAPSE' : 'INSPECT'} <ChevronRight size={14} style={{ transform: expandedAlertId === alert._id ? 'rotate(90deg)' : 'none', transition: 'all 0.2s' }} />
                   </button>
                   {!alert.resolved && (
                     <button 
                       className="nav-link"
                       style={{ background: 'hsla(0, 100%, 60%, 0.1)', color: 'var(--color-red)', border: '1px solid hsla(0, 100%, 60%, 0.2)', fontSize: '0.8rem', padding: '0.6rem 1.25rem' }}
                       disabled={resolvingId === alert._id}
                       onClick={async () => {
                         setResolvingId(alert._id);
                         try {
                           await monitorService.resolveAlert(alert._id);
                           setAlerts(alerts.map(a => a._id === alert._id ? { ...a, resolved: true } : a));
                         } catch (e) {
                           console.error("Resolve Failed", e);
                         } finally {
                           setResolvingId(null);
                         }
                       }}
                     >
                       {resolvingId === alert._id ? 'CLEARING...' : 'RESOLVE'}
                     </button>
                   )}
                </div>
              </div>

              {expandedAlertId === alert._id && (
                <div className="flex-col gap-6 px-12 pb-8 animate-in" style={{ width: '100%', borderTop: '1px solid hsla(0,0%,100%,0.05)', paddingTop: '2rem' }}>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="sub-surface p-4 flex-col gap-2">
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>SOURCE_LOCATION</span>
                      <code style={{ fontSize: '0.8rem', color: 'var(--color-yellow)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {alert.errorStack ? alert.errorStack.split('\n')[1]?.trim()?.replace('at ', '') || 'Internal Controller' : 'System Engine'}
                      </code>
                    </div>
                    <div className="sub-surface p-4 flex-col gap-2">
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>RECORD_HASH_ID</span>
                      <code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {alert.recordId || 'NODATA_NULL'}
                      </code>
                    </div>
                    <div className="sub-surface p-4 flex-col gap-2">
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>RESOLVED_BIT</span>
                      <code style={{ fontSize: '0.8rem', color: alert.resolved ? 'var(--color-green)' : 'var(--color-red)', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                        {alert.resolved ? '0x01 (TRUE)' : '0x00 (FALSE)'}
                      </code>
                    </div>
                  </div>

                  {alert.errorStack && (
                    <div className="flex-col gap-3">
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>UPLINK_STACK_TRACE</span>
                      <pre className="error-pre" style={{ fontSize: '0.75rem', maxHeight: '250px', background: 'rgba(0,0,0,0.3)', border: '1px solid hsla(0,0%,100%,0.05)', padding: '1.5rem', borderRadius: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {alert.errorStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
