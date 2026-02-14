import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function CreateSpecPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    goal: "",
    users: "",
    constraints: "",
    templateType: "web",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const spec = await api.createSpec(form);
      navigate(`/spec/${spec.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create spec");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page-container">
      <div className="page-header">
        <h1>New Project</h1>
        <p>Let's define the scope of your work.</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>What are you building?</label>
            <textarea
              className="textarea-lg"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="e.g. A personal finance dashboard for freelancers..."
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label>Who is this for?</label>
            <input
              type="text"
              value={form.users}
              onChange={(e) => setForm({ ...form, users: e.target.value })}
              placeholder="e.g. Students, Remote Workers, Administrators"
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label>Any constraints? <span className="label-optional">(Optional)</span></label>
            <textarea
              className="textarea-sm"
              value={form.constraints}
              onChange={(e) => setForm({ ...form, constraints: e.target.value })}
              placeholder="e.g. Mobile-first design, strict security requirements..."
            />
          </div>

          <div className="form-group">
            <label>Platform Type</label>
            <select
              value={form.templateType}
              onChange={(e) => setForm({ ...form, templateType: e.target.value })}
            >
              <option value="web">Web Application</option>
              <option value="mobile">Mobile App</option>
              <option value="internal">Internal Tool</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Generating Plan..." : "Generate Tasks"}
          </button>
        </form>
      </div>
    </div>
  );
}