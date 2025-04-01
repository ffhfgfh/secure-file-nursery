
import { FileType } from '@/types';
import { File, FileText, Image, FileVideo, FileAudio, Archive, Code, File as FileIcon } from 'lucide-react';

export const getIcon = (fileType: FileType) => {
  switch (fileType) {
    case 'image':
      return Image;
    case 'document':
      return FileText;
    case 'video':
      return FileVideo;
    case 'audio':
      return FileAudio;
    case 'archive':
      return Archive;
    case 'code':
      return Code;
    case 'pdf':
      return FileIcon;
    default:
      return File;
  }
};
