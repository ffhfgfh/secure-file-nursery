
import { useEffect, useState } from 'react';
import { useFileManager } from '@/hooks/useFileManager';
import { Button } from '@/components/ui/button';
import { X, Download, ChevronLeft, ChevronRight, FileIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FileItem } from '@/types';

interface FilePreviewProps {
  file?: FileItem;
  previewUrl?: string;
}

const FilePreview = ({ file, previewUrl: initialPreviewUrl }: FilePreviewProps = {}) => {
  const { selectedFile, getFilePreviewUrl, setSelectedFile, downloadFile } = useFileManager();
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [loading, setLoading] = useState(!initialPreviewUrl);
  
  const currentFile = file || selectedFile;
  
  useEffect(() => {
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
      setLoading(false);
      return;
    }
    
    if (!currentFile) return;
    
    const loadPreview = async () => {
      setLoading(true);
      const url = await getFilePreviewUrl(currentFile.id);
      setPreviewUrl(url);
      setLoading(false);
    };
    
    loadPreview();
    
    // Clean up preview URL when component unmounts
    return () => {
      if (previewUrl && !initialPreviewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [currentFile, getFilePreviewUrl, initialPreviewUrl]);
  
  if (!currentFile) return null;
  
  const handleDownload = () => {
    if (currentFile) {
      downloadFile(currentFile.id);
    }
  };
  
  const handleClose = () => {
    if (!file) { // Only handle closing if using internal state
      setSelectedFile(null);
    }
    if (previewUrl && !initialPreviewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };
  
  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Skeleton className="h-4/5 w-4/5 rounded-lg" />
        </div>
      );
    }
    
    if (!previewUrl) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <FileIcon className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-medium">Preview not available</h3>
          <p className="mb-4 max-w-md text-muted-foreground">
            This file type cannot be previewed. You can download the file to view its contents.
          </p>
          <Button onClick={handleDownload}>Download File</Button>
        </div>
      );
    }
    
    switch (currentFile.type) {
      case 'image':
        return (
          <div className="flex h-full items-center justify-center">
            <img
              src={previewUrl}
              alt={currentFile.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        );
      
      case 'pdf':
        return (
          <iframe
            src={`${previewUrl}#toolbar=0`}
            title={currentFile.name}
            className="h-full w-full"
          />
        );
      
      case 'video':
        return (
          <div className="flex h-full items-center justify-center">
            <video
              src={previewUrl}
              controls
              className="max-h-full max-w-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 rounded-full bg-primary/10 p-8">
              <FileIcon className="h-16 w-16 text-primary" />
            </div>
            <h3 className="mb-4 text-xl font-medium">{currentFile.name}</h3>
            <audio src={previewUrl} controls>
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      default:
        return (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <FileIcon className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium">Preview not available</h3>
            <p className="mb-4 max-w-md text-muted-foreground">
              This file type cannot be previewed. You can download the file to view its contents.
            </p>
            <Button onClick={handleDownload}>Download File</Button>
          </div>
        );
    }
  };
  
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-card p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">{currentFile.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="relative flex-1 overflow-hidden bg-card/50">
        {renderPreviewContent()}
      </div>
    </div>
  );
};

export default FilePreview;
