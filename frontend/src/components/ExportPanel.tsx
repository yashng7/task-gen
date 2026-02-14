/* ... imports ... */

export default function ExportPanel({ specId }: Props) {
  /* ... logic ... */

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