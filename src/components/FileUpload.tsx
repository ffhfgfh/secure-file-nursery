
import { useState, useCallback } from 'react';
import { useFileManager } from '@/hooks/useFileManager';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FileUpload = () => {
  const { uploadFiles } = useFileManager();
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  }, [uploadFiles]);
  
  return (
    <div 
      className={`file-drop-area ${isDragging ? 'active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium">Upload Files</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Drag and drop files here, or click to select files
        </p>
        <label htmlFor="file-upload">
          <Button asChild>
            <span>Select Files</span>
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileSelect}
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Files will be encrypted and securely stored
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
