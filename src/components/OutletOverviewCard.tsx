import { Server, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OutletOverviewCard = ({ outlet }: { outlet: any }) => {
  const isOnline = outlet.status === 'ONLINE';
  const hasWarning = outlet.status === 'WARNING';
    const hasError = outlet.status === 'SYNC_ERROR';
  
    const hasMismatch = outlet.syncVerification?.tables && 
                       Object.values(outlet.syncVerification.tables).some((t: any) => t.isMatched === false);
  
    const indicatorClass = isOnline ? 'status-green' : hasWarning ? 'status-yellow' : 'status-red';
  
    const formatBytes = (bytes: number) => {
      if (!bytes) return '0 B';
      const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };
  
    return (
      <Link to={`/outlets/${outlet.outletId}`} style={{ textDecoration: 'none', display: 'block' }} className="animate-in mb-2">
        <div 
          className="surface-hud flex-col gap-6 group" 
          style={{ 
            borderColor: hasMismatch ? 'var(--color-red)' : hasError ? 'hsla(0, 85%, 60%, 0.4)' : '',
            padding: '1.5rem 2rem',
            background: hasMismatch ? 'linear-gradient(135deg, hsla(0, 95%, 60%, 0.05), transparent)' : ''
          }}
        >
          <div className="hud-corner hud-corner-tl"></div>
          <div className="hud-corner hud-corner-tr"></div>
          <div className="scanline"></div>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="sub-surface" style={{ padding: '0.85rem', borderRadius: '12px', background: 'hsla(var(--hue), 100%, 60%, 0.05)', border: '1px solid hsla(var(--hue), 100%, 60%, 0.1)' }}>
                <Server size={28} color={isOnline ? 'var(--color-blue)' : 'var(--color-red)'} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px', margin: 0, textTransform: 'uppercase' }}>{outlet.outletName}</h3>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-blue)', fontWeight: 900, letterSpacing: '1px', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>V.{outlet.metrics?.posVersion || '2.4'}</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, margin: 0 }} className="flex items-center gap-1.5">
                    <Clock size={10} /> {new Date(outlet.lastHeartbeat).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
            <div className={`status-indicator ${indicatorClass}`} style={{ width: 14, height: 14, marginTop: '0.5rem' }}></div>
          </div>

        {/* Dynamic Warning Banner */}
        {(hasMismatch || hasError) && (
          <div className="flex items-center gap-3 px-4 py-2" style={{ background: 'hsla(0, 100%, 60%, 0.1)', border: '1px solid hsla(0, 100%, 60%, 0.2)', borderRadius: '10px' }}>
            <AlertTriangle size={14} color="var(--color-red)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-red)', letterSpacing: '1px' }}>
              {hasMismatch ? 'DATA_INTEGRITY_FAULT' : 'NODE_SYNC_FAILURE'}
            </span>
          </div>
        )}

        {/* Core Hardware Metrics row */}
        {outlet.metrics && (
          <div className="grid grid-cols-3 gap-3" style={{ fontFamily: 'var(--font-mono)' }}>
             <div className="sub-surface flex-col gap-2" style={{ padding: '0.75rem', textAlign: 'center', background: 'hsla(0,0%,100%,0.02)' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>PING</span>
                <strong style={{ fontSize: '1.1rem', color: outlet.metrics.pingMs > 200 ? 'var(--color-yellow)' : 'var(--color-green)' }}>{outlet.metrics.pingMs || 0}<span style={{ fontSize: '0.7rem', opacity: 0.7 }}>MS</span></strong>
             </div>
             <div className="sub-surface flex-col gap-2" style={{ padding: '0.75rem', textAlign: 'center', background: 'hsla(0,0%,100%,0.02)' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>DISK</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{formatBytes(outlet.metrics.sqliteSizeBytes).split(' ')[0]}<span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{formatBytes(outlet.metrics.sqliteSizeBytes).split(' ')[1]}</span></strong>
             </div>
             <div className="sub-surface flex-col gap-2" style={{ padding: '0.75rem', textAlign: 'center', background: 'hsla(0,0%,100%,0.02)' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>CORE</span>
                <strong style={{ fontSize: '1.1rem', color: outlet.metrics.cpuUsagePercent > 70 ? 'var(--color-red)' : 'var(--text-primary)' }}>{outlet.metrics.cpuUsagePercent || 0}<span style={{ fontSize: '0.7rem', opacity: 0.7 }}>%</span></strong>
             </div>
          </div>
        )}

        <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <div className="flex-col gap-1">
               <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>UPLINK_ADDR</span>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{outlet.metrics?.localIp || '0.0.0.0'}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--color-blue)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px' }}>
               COMMAND <ChevronRight size={18} />
            </div>
        </div>
      </div>
    </Link>
  );
};

export default OutletOverviewCard;
