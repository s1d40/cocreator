"use client";

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  file: File | null;
  onFileRemove: () => void;
}

export function FileUpload({ onFileUpload, file, onFileRemove }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileRemove();
  };

  return (
    <div
      {...getRootProps()}
      className={`w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50 hover:border-primary'}`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <FileIcon className="h-8 w-8 text-primary" />
            <p className="text-lg font-medium">{file.name}</p>
            <Button variant="ghost" size="icon" onClick={removeFile}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {Math.round(file.size / 1024)} KB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-sm text-muted-foreground">
            PDF, TXT, and other document formats are supported.
          </p>
        </div>
      )}
    </div>
  );
}
