import {
  Database,
  Server,
  CheckCircle2,
  XCircle,
  HardDrive,
  Cpu,
  Wifi,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { OutletState } from "../services/api";

const mockChartData = [
  { name: "Mon", success: 98.5, failed: 1.5 },
  { name: "Tue", success: 99.1, failed: 0.9 },
  { name: "Wed", success: 97.2, failed: 2.8 },
  { name: "Thu", success: 99.8, failed: 0.2 },
  { name: "Fri", success: 95.0, failed: 5.0 },
  { name: "Sat", success: 99.9, failed: 0.1 },
  { name: "Sun", success: 100, failed: 0 },
];

const OutletHealthCard = ({ outlet }: { outlet: OutletState }) => {
  const isOnline = outlet.status === "ONLINE";
  const hasWarning = outlet.status === "WARNING";
  const indicatorClass = isOnline
    ? "status-green"
    : hasWarning
      ? "status-yellow"
      : "status-red";

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024,
      sizes = ["B", "KB", "MB", "GB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const renderPullRow = (name: string, data: any) => {
    const audit = outlet.syncVerification?.tables?.[name];
    const localCount =
      audit?.localCount ?? data?.localCount ?? data?.count ?? 0;
    const cloudCount = audit?.cloudCount ?? data?.cloudCount;
    const isMatched =
      audit?.isMatched ??
      (cloudCount !== undefined
        ? localCount === cloudCount
        : (data?.status ?? false));

    return (
      <div
        className="table-row group hover:bg-white/5 transition-all"
        key={name}
        style={{
          fontSize: "0.85rem",
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderLeft: `3px solid ${isMatched ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
          marginBottom: "4px",
          position: "relative",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 6,
              height: 6,
              background: isMatched ? "var(--color-green)" : "var(--color-red)",
              borderRadius: "2px",
              boxShadow: `0 0 10px ${isMatched ? "var(--color-green)" : "var(--color-red)"}`,
            }}
          ></div>
          <span
            className="table-name"
            style={{
              color: "var(--text-secondary)",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontSize: "0.75rem",
            }}
          >
            {name}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div
            className="flex gap-4"
            style={{
              background: "rgba(0,0,0,0.2)",
              padding: "4px 12px",
              borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontWeight: 900,
              }}
            >
              L:
              <span style={{ color: "var(--text-primary)" }}>{localCount}</span>
            </span>
            {cloudCount !== undefined && (
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 900,
                }}
              >
                C:
                <span
                  style={{
                    color: isMatched
                      ? "var(--color-green)"
                      : "var(--color-red)",
                  }}
                >
                  {cloudCount}
                </span>
              </span>
            )}
          </div>
          <span className="flex items-center">
            {cloudCount === undefined ? (
              data?.status ? (
                <CheckCircle2
                  size={16}
                  color="var(--color-green)"
                  strokeWidth={3}
                />
              ) : (
                <XCircle size={16} color="var(--color-red)" strokeWidth={3} />
              )
            ) : isMatched ? (
              <CheckCircle2
                size={16}
                color="var(--color-green)"
                strokeWidth={3}
              />
            ) : (
              <XCircle size={16} color="var(--color-red)" strokeWidth={3} />
            )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-48 pb-16">
      {/* 1. HEADER SECTION */}
      <div
        className="surface flex justify-between items-center p-8"
        style={{
          background: "hsla(0,0%,100%,0.02)",
          borderLeft: "4px solid var(--color-blue)",
        }}
      >
        <div className="flex items-center gap-8">
          <div
            style={{
              background: "var(--color-blue)",
              width: 64,
              height: 64,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px hsla(210, 100%, 60%, 0.25)",
            }}
          >
            <Server size={32} color="white" />
          </div>
          <div className="flex-col gap-2">
            <div className="flex items-center gap-4">
              <h2
                style={{
                  margin: 0,
                  fontSize: "2.4rem",
                  fontWeight: 900,
                  letterSpacing: "-1px",
                }}
              >
                {outlet.outletName}
              </h2>
              <div
                style={{
                  padding: "0.3rem 0.8rem",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "var(--color-blue)",
                  letterSpacing: "1px",
                }}
              >
                V.{outlet.metrics?.posVersion}
              </div>
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.5px",
              }}
            >
              NODE_ID:{" "}
              <span style={{ color: "var(--text-secondary)" }}>
                {outlet.outletId}
              </span>{" "}
              | LAST_BEAT:{" "}
              <span style={{ color: "var(--text-secondary)" }}>
                {new Date(outlet.lastHeartbeat).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-6 pr-4">
            <div className="flex-col items-end">
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  marginBottom: "0.25rem",
                }}
              >
                COMM_STATUS
              </span>
              <div className="flex items-center gap-3">
                <div
                  className={`status-indicator ${indicatorClass}`}
                  style={{ width: 12, height: 12 }}
                ></div>
                <span
                  style={{
                    fontWeight: 900,
                    color: isOnline ? "var(--color-green)" : "var(--color-red)",
                    fontSize: "1.1rem",
                  }}
                >
                  {outlet.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VITALS MATRIX */}
      <div className="grid gap-80" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
        <div className="flex flex-col gap-6 ">
          <div className="flex items-center gap-3 px-2">
            <div
              style={{
                width: 8,
                height: 24,
                background: "var(--color-blue)",
                borderRadius: 4,
                marginTop: "3rem",
              }}
            ></div>
            <h4
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 900,
                letterSpacing: "1px",
                marginTop: "3rem",
              }}
            >
              NODE_HARDWARE_VITALS
            </h4>
          </div>
          <div
            className="grid grid-cols-2 gap-10"
            style={{ flex: 1, padding: "2rem", gap: "1rem" }}
          >
            {[
              {
                label: "LATENCY",
                value: `${outlet.metrics.pingMs || 0}MS`,
                icon: Wifi,
                color:
                  (outlet.metrics.pingMs || 0) > 200
                    ? "var(--color-yellow)"
                    : "var(--color-green)",
              },
              {
                label: "DB_WEIGHT",
                value: formatBytes(outlet.metrics.sqliteSizeBytes || 0),
                icon: Database,
                color: "var(--color-blue)",
              },
              {
                label: "CPU_CYCLE",
                value: `${outlet.metrics.cpuUsagePercent || 0}%`,
                icon: Cpu,
                color:
                  (outlet.metrics.cpuUsagePercent || 0) > 70
                    ? "var(--color-red)"
                    : "var(--text-primary)",
              },
              {
                label: "STORAGE_FREE",
                value: `${outlet.metrics.diskSpaceFreeGb ?? 0} GB`,
                icon: HardDrive,
                color:
                  (outlet.metrics.diskSpaceFreeGb ?? 100) < 5
                    ? "var(--color-red)"
                    : "var(--color-blue)",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="surface flex flex-col justify-center gap-4 p-8 group hover:bg-white/5 transition-all"
                style={{ height: "180px" }}
              >
                <div className="flex justify-between items-center">
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: 10,
                      borderRadius: 12,
                    }}
                  >
                    <stat.icon size={20} color={stat.color} />
                  </div>
                  <div
                    style={{
                      width: 30,
                      height: 4,
                      background: stat.color,
                      borderRadius: 2,
                      opacity: 0.3,
                    }}
                  ></div>
                </div>
                <div className="flex-col">
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--text-muted)",
                      fontWeight: 800,
                      letterSpacing: "1.5px",
                    }}
                  >
                    {stat.label}
                  </span>
                  <strong
                    style={{
                      fontSize: "1.6rem",
                      color: stat.color || "var(--text-primary)",
                      fontWeight: 900,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {stat.value}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="flex flex-col gap-6 pl-16"
          style={{
            borderLeft: "2px solid rgba(255,255,255,0.08)",
            padding: "2rem",
          }}
        >
          <div className="flex items-center gap-3 px-2">
            <div
              style={{
                width: 8,
                height: 24,
                background: "var(--color-green)",
                borderRadius: 4,
                marginTop: "1rem",
              }}
            ></div>
            <h4
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 900,
                letterSpacing: "1px",
                marginTop: "1rem",
              }}
            >
              NETWORK_PERFORMANCE_MATRIX
            </h4>
          </div>
          <div
            className="surface"
            style={{
              background: "hsla(0,0%,100%,0.01)",
              height: "400px",

              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorSuccess"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-green)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-green)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontWeight: 700 }}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="success"
                    stroke="var(--color-green)"
                    fillOpacity={1}
                    fill="url(#colorSuccess)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SYNC INTEGRITY AUDIT */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end px-2">
          <div
            className="hud-title"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
              padding: "1.5rem 2rem",
              borderLeft: "4px solid var(--color-green)",
              width: "100%",
              borderRadius: "0 12px 12px 0",
            }}
          >
            <div className="flex-col">
              <h4
                className="glow-text"
                style={
                  {
                    margin: 0,
                    fontSize: "1.6rem",
                    fontWeight: 950,
                    letterSpacing: "3px",
                    color: "var(--text-primary)",
                    textTransform: "uppercase",
                  } as any
                }
              >
                LIVE_SYNCHRONIZATION & DAILY_INTEGRITY_AUDIT
              </h4>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  color: "var(--color-green)",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  letterSpacing: "2px",
                  fontFamily: "var(--font-mono)",
                  opacity: 0.8,
                }}
              >
                REALTIME_DATA_INTEGRITY_VERIFICATION_MODULE
              </p>
            </div>
          </div>
        </div>

        <div
          className="surface-hud p-0 overflow-hidden"
          style={{
            border: "1px solid var(--border-color)",
            position: "relative",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div className="hud-corner hud-corner-tl"></div>
          <div className="hud-corner hud-corner-tr"></div>
          <div className="hud-corner hud-corner-bl"></div>
          <div className="hud-corner hud-corner-br"></div>
          <div className="scanline" style={{ opacity: 0.1 }}></div>

          {[
            { id: "bills", label: "Invoices & Bills" },
            { id: "billModifierActions", label: "Modifier Actions" },
            { id: "billSplits", label: "Bill Splits" },
            { id: "orders", label: "Sales Orders" },
            { id: "kots", label: "Kitchen KOTs" },
            { id: "kotItems", label: "KOT Items" },
            { id: "kotItemAddonChoices", label: "Addon Choices" },
            { id: "kotItemAddonGroups", label: "Addon Groups" },
            { id: "kotItemVariants", label: "Item Variants" },
            { id: "tableSessions", label: "Table Sessions" },
            { id: "duesUserHistory", label: "Dues History" },
            { id: "duesUsers", label: "Dues Users" },
            { id: "npcUsers", label: "NPC Users" },
            { id: "users", label: "System Users" },
            { id: "extendedBillDurations", label: "Extended Bills" },
          ].map((item, idx) => {
            const auditData = outlet.syncVerification?.tables?.[item.id];
            const pushData = outlet.pushSync?.tables?.[item.id];
            const localCount = auditData?.localCount ?? 0;
            const cloudCount = auditData?.cloudCount;
            const pendingCount = pushData?.pendingCount ?? 0;
            const isMatched =
              auditData?.isMatched ??
              (localCount === cloudCount && cloudCount !== undefined);
            const isMismatch = cloudCount !== undefined && !isMatched;

            return (
              <div
                key={item.id}
                className={`audit-row group hover:bg-white/5 transition-all ${isMismatch ? "mismatch" : ""}`}
                style={{ 
                  borderBottom: idx === 14 ? "none" : "1px solid rgba(255,255,255,0.03)",
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
                  padding: '1.25rem 1.5rem',
                  alignItems: 'center',
                  background: isMismatch ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                }}
              >
                <div className="flex items-center gap-4 pl-4">
                  <div style={{ width: 4, height: 16, background: isMismatch ? 'var(--color-red)' : 'var(--color-green)', borderRadius: 2 }}></div>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: "0.85rem",
                      color: isMismatch
                        ? "var(--color-red)"
                        : "var(--text-primary)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {item.label.toUpperCase()}
                  </span>
                </div>

                <div className="text-center font-mono">
                  <span
                    style={{
                      fontSize: "1.1rem",
                      color: "var(--text-secondary)",
                      fontWeight: 800,
                    }}
                  >
                    {localCount.toLocaleString()}
                  </span>
                </div>

                <div className="text-center font-mono">
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color:
                        cloudCount === undefined
                          ? "var(--text-muted)"
                          : isMismatch
                            ? "var(--color-red)"
                            : "var(--text-secondary)",
                    }}
                  >
                    {cloudCount?.toLocaleString() ?? "---"}
                  </span>
                </div>

                <div className="text-center">
                  <div
                    style={{
                      display: "inline-flex",
                      padding: "4px 10px",
                      borderRadius: 4,
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      background:
                        pendingCount > 0
                          ? "hsla(30, 100%, 60%, 0.1)"
                          : "hsla(0, 0%, 100%, 0.03)",
                      color:
                        pendingCount > 0
                          ? "var(--color-yellow)"
                          : "var(--text-muted)",
                      border:
                        pendingCount > 0
                          ? "1px solid hsla(30, 100%, 60%, 0.2)"
                          : "1px solid transparent",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {pendingCount > 0 ? `↑ ${pendingCount} PKT` : "STABLE"}
                  </div>
                </div>

                <div className="flex justify-end items-center gap-4 pr-4">
                  {cloudCount === undefined ? (
                    <span
                      className="animate-pulse"
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--text-muted)",
                        fontWeight: 900,
                        letterSpacing: "1px",
                      }}
                    >
                      SCANNING...
                    </span>
                  ) : isMatched ? (
                    <div
                      className="flex items-center gap-2"
                      style={{ color: "var(--color-green)" }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 950,
                          letterSpacing: "1px",
                        }}
                      >
                        VERIFIED
                      </span>
                      <CheckCircle2 size={16} strokeWidth={3} />
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2"
                      style={{ color: "var(--color-red)" }}
                    >
                      <span
                        className="animate-pulse"
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 950,
                          letterSpacing: "1px",
                        }}
                      >
                        DATA_GAP
                      </span>
                      <XCircle size={16} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. GLOBAL CONFIG PULL QUEUES */}
      <div className="flex flex-col gap-8">
        <div
          className="hud-title"
          style={{ marginBottom: 0, marginTop: "4rem", paddingLeft: "0.5rem" }}
        >
          <div
            className="hud-title-line"
            style={{ background: "var(--color-blue)", height: 28, width: 6 }}
          ></div>
          <h4
            className="glow-text"
            style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: 950,
              letterSpacing: "2px",
              color: "var(--text-primary)",
            }}
          >
            GLOBAL_CONFIG_PULL_QUEUES
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-12">
          {["structure", "menu", "security", "backup"].map((pullType) => {
            const pullData = outlet.pullSync?.[pullType];
            if (!pullData) return null;
            return (
              <div
                key={pullType}
                className="surface-hud flex flex-col p-16 group hover:shadow-[0_0_40px_rgba(var(--color-blue-rgb),0.15)] transition-all"
                style={{
                  position: "relative",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="hud-corner hud-corner-tl"></div>
                <div className="hud-corner hud-corner-tr"></div>
                <div className="hud-corner hud-corner-bl"></div>
                <div className="hud-corner hud-corner-br"></div>
                <div className="scanline" style={{ opacity: 0.2 }}></div>

                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    <div
                      style={{
                        width: 6,
                        height: 32,
                        background: "var(--color-blue)",
                        borderRadius: 2,
                      }}
                    ></div>
                    <div className="flex flex-col">
                      <strong
                        style={{
                          fontSize: "1.4rem",
                          color: "var(--text-primary)",
                          fontWeight: 950,
                          letterSpacing: "3px",
                        }}
                      >
                        {pullType.toUpperCase()}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          color: "var(--text-muted)",
                          fontWeight: 800,
                          letterSpacing: "1px",
                        }}
                      >
                        SYSTEM_SYNC_MODULE
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex items-center"
                    style={{
                      padding: "0.5rem",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "12px",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    {pullData.status ? (
                      <CheckCircle2
                        size={28}
                        color="var(--color-green)"
                        strokeWidth={3}
                      />
                    ) : (
                      <XCircle
                        size={28}
                        color="var(--color-red)"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                </div>

                <div
                  className="flex-col gap-1 mb-6"
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                  }}
                >
                  <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
                    <span>LAST_UPLINK</span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {pullData.lastSyncTime
                        ? new Date(pullData.lastSyncTime).toLocaleTimeString()
                        : "NEVER"}
                    </span>
                  </div>
                  {pullData.error && (
                    <div
                      style={{
                        color: "var(--color-red)",
                        marginTop: "8px",
                        padding: "10px",
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        lineHeight: "1.4",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 900,
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        FAULT_DETECTED:
                      </span>
                      {pullData.error}
                    </div>
                  )}
                </div>

                {pullData.tables && Object.keys(pullData.tables).length > 0 && (
                  <div
                    className="flex-col gap-2"
                    style={{
                      marginTop: "0.5rem",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      paddingTop: "2rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 950,
                        color: "var(--text-muted)",
                        letterSpacing: "1.5px",
                        display: "block",
                        marginBottom: "1.25rem",
                        paddingLeft: "1.25rem",
                      }}
                    >
                      TABLE_TELEMETRY
                    </span>
                    {Object.entries(pullData.tables).map(([k, v]) =>
                      renderPullRow(k, v),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OutletHealthCard;
