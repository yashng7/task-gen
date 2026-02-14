import { useState } from "react";

interface Props {
  onSave: (groupName: string) => void;
  onClose: () => void;
}

export default function GroupModal({ onSave, onClose }: Props) {
  const [groupName, setGroupName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) onSave(groupName.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Create Group</h3>
        <p className="modal-subtitle">
          Organize selected tasks into a specific category.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Backend Infrastructure"
              required
              autoFocus
            />
          </div>
          <div className="btn-group modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Group</button>
          </div>
        </form>
      </div>
    </div>
  );
}