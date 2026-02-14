import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { SpecSummary } from "../types";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [specs, setSpecs] = useState<SpecSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSpecs = () => {
    api.getSpecs().then((data) => {
      setSpecs(data.specs);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadSpecs(); }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this spec and all its tasks?")) return;

    try {
      await api.deleteSpec(id);
      setSpecs((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div className="history-page-container">
      <div className="page-header">
        <h1>Recent Projects</h1>
      </div>

      {specs.length === 0 ? (
        <div className="card empty-state">
          No projects yet. <span className="link-text" onClick={() => navigate('/create')}>Create one?</span>
        </div>
      ) : (
        specs.map((spec) => (
          <div
            key={spec.id}
            className="history-item"
            onClick={() => navigate(`/spec/${spec.id}`)}
          >
            <div className="history-info">
              <div className="history-title">
                {spec.goal}
              </div>
              <div className="history-meta">
                {new Date(spec.createdAt).toLocaleDateString()} • {spec.taskCount} items • {spec.templateType}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                className="btn btn-sm"
                style={{ background: "#450a0a", color: "#f87171" }}
                onClick={(e) => handleDelete(e, spec.id)}
              >
                Delete
              </button>
              <span className="history-arrow">→</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}