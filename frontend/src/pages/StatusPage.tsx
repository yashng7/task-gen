import { useState, useEffect } from "react";
import { api } from "../api/client";
import { StatusResponse } from "../types";

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState("");

  const fetchStatus = () => {
    api.getStatus()
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : "Connection failed"));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className="error-msg">Error: {error}</div>;
  if (!status) return <div className="loading">Checking status...</div>;

  return (
    <div className="status-page-container">
      <div className="page-header">
        <h1>System Status</h1>
      </div>

      <div className="card">
        <h3 className="card-title-border">Services</h3>
        
        <div className="status-row">
          <span>API Server</span>
          <span className="status-indicator-wrapper">
            <span className={`status-dot ${status.backend.status === "healthy" ? "green" : "red"}`} />
            {status.backend.status === "healthy" ? "Operational" : "Degraded"}
          </span>
        </div>
        
        <div className="status-row">
          <span>Database</span>
          <span className="status-indicator-wrapper">
             <span className={`status-dot ${status.database.status === "connected" ? "green" : "red"}`} />
            {status.database.status === "connected" ? "Connected" : "Error"}
          </span>
        </div>

         <div className="status-meta">
          Uptime: {Math.floor(status.backend.uptime / 60)} minutes • Latency: {status.database.latency_ms}ms
        </div>
      </div>
    </div>
  );
}