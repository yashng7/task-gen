import { useState } from "react";
import { api } from "../api/client";

interface Props {
  specId: string;
}

export default function ExportPanel({ specId }: Props) {
  const [preview, setPreview] = useState("");
  const [format, setFormat] = useState<"markdown" | "text">("markdown");

  const handlePreview = async () => {
    const content = await api.exportSpec(specId, format);
    setPreview(content);
  };

  const handleDownload = async () => {
    const content = await api.exportSpec(specId, format);
    const ext = format === "markdown" ? "md" : "txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spec-${specId}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const content = await api.exportSpec(specId, format);
    await navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  return (
    <div className="export-panel">
      <div className="export-controls">
        <div className="form-group flex-grow-no-margin">
          <label className="label-sm">Export Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "markdown" | "text")}
          >
            <option value="markdown">Markdown (.md)</option>
            <option value="text">Plain Text (.txt)</option>
          </select>
        </div>
        <button className="btn btn-secondary" onClick={handlePreview}>Preview</button>
        <button className="btn btn-secondary" onClick={handleCopy}>Copy</button>
        <button className="btn btn-primary" onClick={handleDownload}>Download File</button>
      </div>
      {preview && <div className="export-preview">{preview}</div>}
    </div>
  );
}