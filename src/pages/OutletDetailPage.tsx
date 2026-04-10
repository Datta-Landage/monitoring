import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OutletHealthCard from "../components/OutletHealthCard";
import { monitorService } from "../services/api";

const OutletDetailPage = () => {
  const { outletId } = useParams();
  const [outlet, setOutlet] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await monitorService.getOutlets();
        const found = data.find((o: any) => o.outletId === outletId);
        setOutlet(found);
      } catch (e) {
        console.error("Failed to fetch outlet details", e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [outletId]);

  if (!outlet) return <div className="container">Loading...</div>;

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end mb-12">
        <div className="flex-col gap-6">
          <div className="hud-title" style={{ marginBottom: 0 }}>
            <div
              className="hud-title-line"
              style={{ height: 80, width: 8 }}
            ></div>
            <div className="flex-col">
              <h1
                style={{
                  fontSize: "4.2rem",
                  lineHeight: 0.9,
                  fontWeight: 950,
                  letterSpacing: "-3px",
                  textTransform: "uppercase",
                  margin: "2rem",
                }}
              >
                {outlet.outletName}{" "}
                <span style={{ color: "var(--color-blue)", opacity: 0.8 }}>
                  NODE_CORE
                </span>
              </h1>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: "1.2rem",
                  letterSpacing: "1px",
                  marginTop: "1rem",
                }}
              >
                DEEP_GRANULAR_TELEMETRY_&_SYNCHRONIZATION_MATRIX
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: "0 auto", width: "100%" }}>
        <OutletHealthCard outlet={outlet} />
      </div>
    </div>
  );
};

export default OutletDetailPage;
