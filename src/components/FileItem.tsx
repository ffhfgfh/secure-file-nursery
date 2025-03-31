
import { useMemo } from 'react';
import { FileItem as FileItemType } from '@/types';
import { 
  FileIcon, 
  ImageIcon, 
  FileTextIcon, 
  FileVideoIcon, 
  FileAudioIcon, 
  FileArchiveIcon, 
  FileCode,
  FilePdf,
  MoreVertical,
  Download,
  Trash2,
  Lock,
  Copy,
  Eye,
  Star
} from 'lucide-react';
import { useFileManager } from '@/hooks/useFileManager';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface FileItemProps {
  file: FileItemType;
  isSelected: boolean;
  view: 'grid' | 'list';
  onClick: () => void;
  onDoubleClick: () => void;
}

const FileItem = ({ file, isSelected, view, onClick, onDoubleClick }: FileItemProps) => {
  const { downloadFile, deleteItems, formatFileSize, setSelectedFile } = useFileManager();
  
  const fileIcon = useMemo(() => {
    switch (file.type) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
      case 'document':
        return <FileTextIcon className="h-8 w-8 text-green-500" />;
      case 'video':
        return <FileVideoIcon className="h-8 w-8 text-pink-500" />;
      case 'audio':
        return <FileAudioIcon className="h-8 w-8 text-purple-500" />;
      case 'archive':
        return <FileArchiveIcon className="h-8 w-8 text-yellow-500" />;
      case 'code':
        return <FileCode className="h-8 w-8 text-gray-500" />;
      case 'pdf':
        return <FilePdf className="h-8 w-8 text-red-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-400" />;
    }
  }, [file.type]);
  
  const handleView = () => {
    setSelectedFile(file);
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadFile(file.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItems([file.id]);
  };
  
  if (view === 'grid') {
    return (
      <div 
        className={`group relative flex h-44 w-40 flex-col rounded-lg border bg-card p-3 transition-all hover:border-primary ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <div className="mb-2 flex flex-1 items-center justify-center">
          {fileIcon}
        </div>
        <div className="mt-auto space-y-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="line-clamp-2 break-all text-sm font-medium">{file.name}</p>
            {file.encrypted && <Lock className="h-3 w-3 text-primary" />}
          </div>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleView}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" />
              Add to favorites
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
  return (
    <div 
      className={`group flex items-center rounded-lg border p-3 transition-all hover:border-primary ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="mr-3">{fileIcon}</div>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-1">
            <p className="truncate font-medium">{file.name}</p>
            {file.encrypted && <Lock className="h-3 w-3 text-primary" />}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)} · {file.lastModified.toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleView}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" />
                Add to favorites
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default FileItem;
