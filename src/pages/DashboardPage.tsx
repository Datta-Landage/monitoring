import { useState, useEffect } from 'react';
import { monitorService } from '../services/api';
import OutletOverviewCard from '../components/OutletOverviewCard';
import { Users, Activity, AlertTriangle, Wifi } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

const StatCard = ({ label, value, subValue, icon: Icon, color }: any) => (
  <div className="surface-hud flex-col gap-4" style={{ flex: 1, minWidth: '280px', borderLeft: `4px solid ${color}`, background: `linear-gradient(135deg, ${color}08, transparent)`, padding: '1.5rem 2rem' }}>
    <div className="hud-corner hud-corner-tl" style={{ borderColor: color }}></div>
    <div className="hud-corner hud-corner-tr" style={{ borderColor: color }}></div>
    <div className="flex justify-between items-center">
      <div className="flex-col">
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</span>
        <h2 className="glow-text" style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-2px', margin: '0.25rem 0', color: 'var(--text-primary)' }}>{value}</h2>
      </div>
      <div style={{ background: `${color}15`, padding: '12px', borderRadius: '12px', border: `1px solid ${color}30` }}>
        <Icon size={24} color={color} style={{ filter: `drop-shadow(0 0 10px ${color}60)` }} />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="status-indicator" style={{ background: color, width: 6, height: 6 }}></div>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>{subValue.toUpperCase()}</span>
    </div>
    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', width: '100%', marginTop: '0.5rem', position: 'relative', overflow: 'hidden' }}>
       <div style={{ height: '100%', background: color, width: '45%', boxShadow: `0 0 10px ${color}` }}></div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [outlets, setOutlets] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('fleet_data');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await monitorService.getOutlets();
        setOutlets(data || []);
        localStorage.setItem('fleet_data', JSON.stringify(data || []));
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to connect to monitoring server.");
      } finally {
        setLoading(false);
      }
    };
    // fetch();
    const interval = setInterval(fetch, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const onlineCount = outlets.filter(o => o.status === 'ONLINE').length;
  const issueCount = outlets.length - onlineCount;
  
  const mismatchCount = outlets.filter(o => {
    if (!o.syncVerification?.tables) return false;
    return Object.values(o.syncVerification.tables).some((t: any) => t.isMatched === false);
  }).length;

  const avgLatency = outlets.length > 0 
    ? Math.round(outlets.reduce((sum, o) => sum + (o.metrics?.pingMs || 0), 0) / outlets.length) 
    : 0;

  if (loading) return (
    <div className="flex justify-center items-center" style={{ height: '60vh' }}>
      <div className="animate-pulse flex-col items-center gap-4">
        <Activity size={48} color="var(--color-blue)" />
        <span style={{ fontWeight: 800, letterSpacing: '2px', color: 'var(--color-blue)', fontSize: '0.9rem' }}>LINKING TELEMETRY...</span>
      </div>
    </div>
  );

  if (error && outlets.length === 0) return (
    <div className="surface flex-col items-center gap-6" style={{ margin: '5rem auto', maxWidth: '500px', textAlign: 'center' }}>
      <AlertTriangle size={48} color="var(--color-red)" />
      <div>
        <h2 style={{ color: 'var(--color-red)', marginBottom: '0.5rem' }}>Uplink Failed</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
      <button className="nav-link active px-8" onClick={() => window.location.reload()}>Re-establish Connection</button>
    </div>
  );

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end mb-12">
        <div className="hud-title" style={{ marginBottom: 0 }}>
          <div className="hud-title-line" style={{ height: 64, width: 6 }}></div>
          <div className="flex-col">
            <h1 style={{ fontSize: '3.8rem', lineHeight: 1.1, fontWeight: 950, letterSpacing: '-3px' }}>FLEET_COMMAND</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem', letterSpacing: '1px', marginTop: '0.5rem' }}>GLOBAL_NODE_TELEMETRY_&_SYNCHRONIZATION_MATRIX</p>
          </div>
        </div>
        <div className="sub-surface flex items-center gap-4 px-6 py-3" style={{ border: '1px solid hsla(150, 100%, 50%, 0.2)' }}>
          <div className="status-indicator status-green"></div>
          <span style={{ fontWeight: 800, color: 'var(--color-green)', letterSpacing: '2px', fontSize: '0.85rem' }}>UPLINK_STABLE</span>
        </div>
      </div>

      {error && (
        <div className="sub-surface flex items-center gap-4 px-6 py-4 mb-10 animate-in" style={{ border: '1px solid hsla(0, 100%, 50%, 0.2)', background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.08), transparent)' }}>
          <AlertTriangle size={24} color="var(--color-red)" style={{ filter: 'drop-shadow(0 0 8px var(--color-red))' }} />
          <div className="flex-col">
            <span style={{ fontWeight: 900, color: 'var(--color-red)', letterSpacing: '2px', fontSize: '0.9rem', textTransform: 'uppercase' }}>MATRIX_SYNC_ERROR</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginTop: '2px' }}>{error} (Displaying cached node telemetry)</p>
          </div>
        </div>
      )}

      <div className="flex gap-6 mb-12" style={{ flexWrap: 'wrap' }}>
        <StatCard label="Total Nodes" value={outlets.length} subValue="Active Fleet" icon={Users} color="var(--color-blue)" />
        <StatCard label="Healthy Status" value={onlineCount} subValue="Verified" icon={Activity} color="var(--color-green)" />
        <StatCard label="System Faults" value={issueCount} subValue="Requires Action" icon={AlertTriangle} color="var(--color-red)" />
        <StatCard label="Network Latency" value={`${avgLatency}ms`} subValue="Stable Ping" icon={Wifi} color="var(--color-blue)" />
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
         <div className="surface-hud flex-col gap-6" style={{ minHeight: '400px', position: 'relative', padding: '2rem' }}>
            <div className="hud-corner hud-corner-tl"></div>
            <div className="hud-corner hud-corner-tr"></div>
            <div className="hud-corner hud-corner-bl"></div>
            <div className="hud-corner hud-corner-br"></div>
            <div className="scanline"></div>
            <div className="hud-title" style={{ marginBottom: '1rem' }}>
               <div className="hud-title-line" style={{ background: 'var(--color-blue)', height: 20 }}></div>
               <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 950 }}>NODE_DISTRIBUTION_MATRIX</h4>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Healthy', value: Math.max(0, onlineCount - mismatchCount) },
                      { name: 'Mismatch', value: mismatchCount },
                      { name: 'Offline', value: issueCount }
                    ]}
                    cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value"
                  >
                    <Cell fill="var(--color-green)" stroke="transparent" />
                    <Cell fill="var(--color-yellow)" stroke="transparent" />
                    <Cell fill="var(--color-red)" stroke="transparent" />
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6" style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: 'auto', paddingBottom: '0.5rem' }}>
               <span className="flex items-center gap-2" style={{ color: 'var(--color-green)' }}><div className="status-indicator" style={{ background: 'currentColor' }}></div> HEALTHY</span>
               <span className="flex items-center gap-2" style={{ color: 'var(--color-yellow)' }}><div className="status-indicator" style={{ background: 'currentColor' }}></div> MISMATCH</span>
               <span className="flex items-center gap-2" style={{ color: 'var(--color-red)' }}><div className="status-indicator" style={{ background: 'currentColor' }}></div> OFFLINE</span>
            </div>
        </div>

         <div className="surface-hud flex-col gap-6" style={{ minHeight: '400px', position: 'relative', padding: '2rem' }}>
            <div className="hud-corner hud-corner-tl"></div>
            <div className="hud-corner hud-corner-tr"></div>
            <div className="hud-corner hud-corner-bl"></div>
            <div className="hud-corner hud-corner-br"></div>
            <div className="scanline"></div>
            <div className="hud-title" style={{ marginBottom: '1rem' }}>
               <div className="hud-title-line" style={{ background: 'var(--color-green)', height: 20 }}></div>
               <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 950 }}>NETWORK_PERFORMANCE_PULSE</h4>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={outlets.slice(0, 10).map(o => ({ name: o.outletName.split(' ')[0], Ping: o.metrics?.pingMs || 0 }))}>
                  <defs>
                    <linearGradient id="colorPing" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="Ping" stroke="var(--color-blue)" fillOpacity={1} fill="url(#colorPing)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'auto', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>REAL-TIME LATENCY SPECTRUM</span>
            </div>
        </div>
      </div>

      <div className="surface-hud flex-col gap-8" style={{ position: 'relative', padding: '3rem' }}>
        <div className="hud-corner hud-corner-tl"></div>
        <div className="hud-corner hud-corner-tr"></div>
        <div className="hud-corner hud-corner-bl"></div>
        <div className="hud-corner hud-corner-br"></div>
        <div className="scanline"></div>

        <div className="hud-title" style={{ marginBottom: 0 }}>
          <div className="hud-title-line" style={{ height: 40, width: 6 }}></div>
          <div className="flex-col">
            <h2 className="glow-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 950, letterSpacing: '-1.5px' }}>ACTIVE_NODE_GRID</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px' }}>Global telemetry intake from distributed edge nodes</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {outlets.map(outlet => (
            <OutletOverviewCard key={outlet.outletId} outlet={outlet} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
