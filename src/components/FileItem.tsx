
import { useState, useEffect } from 'react';
import { FileItem as FileItemType } from '@/types/index';
import { Card, CardContent } from '@/components/ui/card';
import { getIcon } from '@/lib/file-icons';
import { useFileManager } from '@/hooks/useFileManager';
import { formatFileSize } from '@/hooks/useFileManager';
import { File, FileText, Image, FileVideo, FileAudio, Archive, Code, File as FileIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import FilePreview from './FilePreview';

interface FileItemProps {
  file: FileItemType;
  view: 'grid' | 'list';
  onSelect: (id: string) => void;
  isSelected: boolean;
}

const FileItem = ({ file, view, onSelect, isSelected }: FileItemProps) => {
  const { getFilePreviewUrl } = useFileManager();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Get icon based on file type
  const getFileIcon = () => {
    switch (file.type) {
      case 'image':
        return <Image />;
      case 'document':
        return <FileText />;
      case 'video':
        return <FileVideo />;
      case 'audio':
        return <FileAudio />;
      case 'archive':
        return <Archive />;
      case 'code':
        return <Code />;
      case 'pdf':
        return <FileIcon />;
      default:
        return <File />;
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (e.detail === 1) {
      // Single click - select
      onSelect(file.id);
    } else if (e.detail === 2) {
      // Double click - preview
      handlePreview();
    }
  };
  
  const handlePreview = async () => {
    // For image files, try to get a preview URL
    if (['image', 'pdf', 'video', 'audio'].includes(file.type)) {
      const url = await getFilePreviewUrl(file.id);
      if (url) {
        setPreviewUrl(url);
        setPreviewOpen(true);
      }
    }
  };
  
  const cardClasses = `
    relative cursor-pointer border-2 transition-all duration-200
    ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent'}
    ${view === 'grid' ? 'p-4 flex flex-col items-center text-center' : 'p-2 flex items-center gap-4'}
  `;
  
  const iconClasses = `
    ${view === 'grid' ? 'text-3xl mb-2' : 'text-xl'}
    ${file.type === 'image' ? 'text-blue-500' : ''}
    ${file.type === 'document' ? 'text-green-500' : ''}
    ${file.type === 'video' ? 'text-red-500' : ''}
    ${file.type === 'audio' ? 'text-purple-500' : ''}
    ${file.type === 'archive' ? 'text-yellow-500' : ''}
    ${file.type === 'code' ? 'text-gray-500' : ''}
    ${file.type === 'pdf' ? 'text-red-600' : ''}
  `;
  
  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  return (
    <>
      <Card className={cardClasses} onClick={handleClick}>
        <CardContent className={`p-0 ${view === 'grid' ? 'flex flex-col items-center' : 'flex-1'}`}>
          {view === 'grid' ? (
            <>
              <div className={iconClasses}>{getFileIcon()}</div>
              <div className="mt-2 text-sm font-medium truncate max-w-full">{file.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatFileSize(file.size)}
              </div>
            </>
          ) : (
            <>
              <div className={iconClasses}>{getFileIcon()}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <span className="mx-2">•</span>
                  <span>{file.lastModified.toLocaleDateString()}</span>
                </div>
              </div>
            </>
          )}
          
          {file.encrypted && (
            <div className="absolute top-1 right-1 bg-primary/10 text-primary text-[10px] px-1 rounded">
              Encrypted
            </div>
          )}
        </CardContent>
      </Card>
      
      {previewOpen && previewUrl && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <FilePreview file={file} previewUrl={previewUrl} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default FileItem;
