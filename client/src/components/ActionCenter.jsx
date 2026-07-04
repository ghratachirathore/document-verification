import { FileUp, MessageSquare, RefreshCw, Upload } from "lucide-react";

export const ActionCenter = ({
  documentTypes = [],
  documentType,
  setDocumentType,
  file,
  setFile,
  uploading,
  existingDocument,
  onUpload,
  clarifications = []
}) => (
  <div className="action-center">
    <form className="action-upload" onSubmit={onUpload}>
      <div>
        <strong>Evidence upload</strong>
        <span>Replace files when a recruiter needs clearer support.</span>
      </div>
      <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} aria-label="Document type">
        {documentTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      <label className="file-picker">
        <FileUp size={16} />
        <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} aria-label="Choose evidence file" />
        {file ? file.name : "Choose evidence file"}
      </label>
      <button className="icon-text-button solid" disabled={uploading || !file} type="submit">
        {existingDocument ? <RefreshCw size={16} /> : <Upload size={16} />}
        {uploading ? "Processing" : existingDocument ? "Replace Evidence" : "Upload Evidence"}
      </button>
    </form>
    <div className="clarification-strip">
      <MessageSquare size={18} />
      <div>
        <strong>{clarifications.length ? "Clarification requested" : "No clarification requests"}</strong>
        <span>{clarifications[0]?.message || "Recruiter requests will appear here when HR needs more evidence."}</span>
      </div>
    </div>
  </div>
);
