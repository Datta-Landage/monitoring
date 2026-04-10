import { useState, useEffect, useRef } from 'react';
import { useNavigate, BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Activity, Volume2, VolumeX, AlertTriangle, Info, LayoutDashboard, ListFilter, RefreshCw } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import OutletDetailPage from './pages/OutletDetailPage';
import AlertsPage from './pages/AlertsPage';
import { monitorService } from './services/api';



const NavLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(() => {
    const saved = localStorage.getItem('monitoring_audio_enabled');
    return saved === null ? true : saved === 'true';
  });
  const [showErrorLog, setShowErrorLog] = useState(false);
  const [prevAlertCount, setPrevAlertCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const isInitialLoad = useRef(true);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);

  const handleEnableAudio = () => {
    setIsAudioBlocked(false);
    playAlarm();
  };


  const playAlarm = () => {
    console.log("Attempting to play alarm sound...");
    try {
      if (!audioRef.current) {
        console.log("Initializing new Audio object with /alert.mp3");
        audioRef.current = new Audio('/alert.mp3');
        audioRef.current.volume = 0.5;
        audioRef.current.onended = () => {
          console.log("Alarm sound ended");
          setIsAlarmPlaying(false);
        };
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          console.log("Audio playback started successfully ✅");
          setIsAlarmPlaying(true);
        })
        .catch(e => {
          console.error("Audio playback blocked or failed ❌:", e);
          setIsAlarmPlaying(false);
          if (e.name === 'NotAllowedError') {
            setIsAudioBlocked(true);
          }
        });
    } catch (e) {
      console.error("Audio trigger exception ❌:", e);
    }
  };

  const stopAlarm = () => {
    console.log("EXEC_COMMAND: [STOP_ALERT] triggered manually 🚨");
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        // Force reset the src to kill any buffered stream if it hangs
        const currentSrc = audioRef.current.src;
        audioRef.current.src = "";
        audioRef.current.load();
        audioRef.current.src = currentSrc;
        
        console.log("STATUS: Audio stream truncated and reset ✅");
      } catch (err) {
        console.error("ERROR: Manual audio stop failed ❌:", err);
      }
    }
    setIsAlarmPlaying(false);
  };
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await monitorService.getAlerts();
        if (data) {
          const activeAlerts = data.filter((a: any) => !a.resolved);
          setAlerts(activeAlerts);
        }
      } catch (e) {
        console.error("Sidebar Alerts Sync Failed", e);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log(`Alert Count Effect: Current=${alerts.length}, Previous=${prevAlertCount}, InitialLoad=${isInitialLoad.current}, AudioEnabled=${audioEnabled}`);
    
    if (isInitialLoad.current) {
      if (alerts.length > 0) {
        console.log("Initial load detected with existing alerts. Setting baseline count.");
        setPrevAlertCount(alerts.length);
      }
      isInitialLoad.current = false;
      return;
    }

    if (alerts.length > prevAlertCount) {
      console.log(`NEW ALERT DETECTED! (${alerts.length} > ${prevAlertCount})`);
      if (audioEnabled) {
        playAlarm();
      } else {
        console.log("Audio is disabled. Skipping alarm playback.");
      }
    }
    
    setPrevAlertCount(alerts.length);
  }, [alerts.length, audioEnabled, prevAlertCount]);

  useEffect(() => {
    localStorage.setItem('monitoring_audio_enabled', audioEnabled.toString());
  }, [audioEnabled]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar px-8">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 mr-4">
            <div style={{ background: 'var(--color-blue)', width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px hsla(210, 100%, 60%, 0.3)' }}>
              <Activity size={22} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-1.5px' }}>SYNC<span style={{ color: 'var(--color-blue)' }}>MONITOR</span></h2>
          </div>
          
          <div className="flex gap-2">
            <NavLink to="/" icon={LayoutDashboard} label="FLEET_COMMAND" />
            <NavLink to="/alerts" icon={ListFilter} label="INCIDENT_FEED" />
          </div>

          {location.pathname !== '/' && (
            <button 
              onClick={() => navigate(-1)}
              className="hud-btn group ml-4"
              style={{ border: '1px solid var(--color-blue)', background: 'hsla(210, 100%, 60%, 0.1)' }}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="glow-text">BACK_COMMAND</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="hud-btn group" 
            onClick={() => window.location.reload()} 
          >
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> 
            <span className="glow-text">REF_PULSE</span>
          </button>

          <div style={{ position: 'relative' }}>
             <button 
               className={`hud-btn ${alerts.length > 0 ? 'hud-btn-red hud-btn-pulse' : ''}`}
               onClick={() => setShowErrorLog(!showErrorLog)}
             >
               <AlertTriangle size={18} color={alerts.length > 0 ? 'var(--color-red)' : 'var(--text-muted)'} />
               {alerts.length > 0 && <span className="glow-text">{alerts.length} FAULTS</span>}
             </button>
          </div>

          <button 
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (audioEnabled) stopAlarm();
            }}
            className={`hud-btn ${audioEnabled ? 'hud-btn-blue' : 'hud-btn-muted'}`}
            title={audioEnabled ? "Mute all siren audio" : "Enable siren alerts"}
          >
            {audioEnabled ? <Volume2 size={18} className={alerts.length > 0 ? "animate-pulse" : ""} /> : <VolumeX size={18} />}
            <span className={audioEnabled ? 'glow-text' : ''}>
              {audioEnabled ? 'SIREN_ACTIVE' : 'SIREN_MUTED'}
            </span>
          </button>

          {audioEnabled && alerts.length > 0 && (
            <button 
              onClick={stopAlarm}
              className={`hud-btn hud-btn-red ${isAlarmPlaying ? 'hud-btn-pulse' : ''}`}
              title="Stop current alert sound"
            >
              <VolumeX size={18} /> <span className="glow-text">STOP_ALERT</span>
            </button>
          )}
        </div>
      </nav>

      <div className="flex" style={{ flex: 1, overflow: 'hidden' }}>
        {/* Main Dashboard Content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-main)' }}>
          {children}
        </main>

        {/* Sliding Error Log Drawer (Side-car legacy) */}
        {showErrorLog && (
          <aside className="surface-hud" style={{
            width: '550px',
            height: '100%',
            borderLeft: '1px solid var(--border-color)',
            overflowY: 'auto',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'relative',
            zIndex: 1000
          }}>
            <div className="hud-corner hud-corner-tl"></div>
            <div className="hud-corner hud-corner-bl"></div>
            <div className="scanline"></div>

            <div className="flex justify-between items-center mb-4">
              <div className="hud-title" style={{ marginBottom: 0 }}>
                <div className="hud-title-line" style={{ background: 'var(--color-red)', height: 24, width: 4 }}></div>
                <h3 className="glow-text" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950, letterSpacing: '2px' }}>
                  RAW_SYNC_FAULTS
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {alerts.length > 1 && (
                  <button 
                  className="hud-btn hud-btn-muted" 
                  style={{ padding: '0.4rem 1rem', fontSize: '0.65rem' }}
                  onClick={() => {
                    alerts.forEach(a => monitorService.resolveAlert(a._id));
                    setAlerts([]);
                  }}
                >
                  CLEAR_ALL
                </button>
                )}
                <button 
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-all font-bold border border-white/5" 
                  onClick={() => setShowErrorLog(false)}
                  style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="flex-col items-center gap-2" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                <Info size={32} />
                <p>No active errors.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert._id} className="surface-hud flex-col gap-4 p-6 group transition-all" style={{ borderLeft: '4px solid var(--color-red)', position: 'relative', background: 'hsla(0, 100%, 50%, 0.05)' }}>
                  <div className="hud-corner hud-corner-tr" style={{ width: 6, height: 6 }}></div>
                  <div className="hud-corner hud-corner-br" style={{ width: 6, height: 6 }}></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="flex-col gap-2">
                      <strong className="glow-text" style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 950, letterSpacing: '-0.5px' }}>{alert.outletName}</strong>
                      <div className="flex gap-2">
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, padding: '3px 10px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-red)', border: '1px solid rgba(239, 68, 68, 0.3)', letterSpacing: '1px' }}>{alert.direction}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', letterSpacing: '0.5px' }}>{alert.apiEndpoint}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex-col gap-2" style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '4px' }}>FAULT_ORIGIN_TELEMETRY</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>TABLE: <span style={{ color: 'var(--color-yellow)' }}>{alert.tableName}</span> {alert.recordId && <span style={{ opacity: 0.6 }}>:: {alert.recordId}</span>}</div>
                    <div style={{ color: '#fca5a5', fontFamily: 'var(--font-mono)', lineHeight: 1.5, wordBreak: 'break-all', fontSize: '0.85rem' }}>{alert.errorMessage}</div>
                  </div>

                  {alert.errorStack && (
                    <div className="flex-col gap-2">
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '1px' }}>DIAGNOSTIC_TRACE_INTAKE</span>
                      <pre className="error-pre" style={{ 
                        margin: 0, 
                        maxHeight: '180px', 
                        overflow: 'auto', 
                        fontSize: '0.75rem', 
                        background: 'rgba(0,0,0,0.4)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        padding: '1rem'
                      }}>
                        {alert.errorStack}
                      </pre>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="hud-btn hud-btn-red" 
                      onClick={() => {
                        monitorService.resolveAlert(alert._id);
                        setAlerts(alerts.filter(a => a._id !== alert._id));
                      }}
                    >
                      <span className="glow-text">RESOLVE_&_CLEAR</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </aside>
        )}
      </div>

      {isAudioBlocked && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem'
        }}>
          <AlertTriangle size={64} className="animate-pulse" style={{ color: 'var(--color-yellow)' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>AUDIO_OUTPUT_BLOCKED</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
            Browser policy requires user interaction to enable siren alerts. Click below to activate.
          </p>
          <button 
            onClick={handleEnableAudio}
            className="hud-btn hud-btn-blue"
            style={{ padding: '1rem 3rem', fontSize: '1.2rem', boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}
          >
            <Volume2 size={24} /> <span className="glow-text">ACTIVATE_SIREN</span>
          </button>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/outlets/:outletId" element={<OutletDetailPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
