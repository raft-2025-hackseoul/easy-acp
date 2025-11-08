import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export function FileUpload({ onFileSelect, isUploading }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${isUploading ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          {isUploading ? (
            <>
              <div className="spinner"></div>
              <p>Processing {fileName}...</p>
            </>
          ) : (
            <>
              <svg
                className="upload-icon"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {fileName ? (
                <p className="file-name">
                  <strong>{fileName}</strong>
                  <br />
                  <small>Drop another file or click to replace</small>
                </p>
              ) : (
                <>
                  <p className="primary">
                    {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                  </p>
                  <p className="secondary">or click to browse</p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
