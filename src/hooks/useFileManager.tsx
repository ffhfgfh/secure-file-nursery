import { useState, useEffect, useCallback } from 'react';
import { FileItem, Folder, SortConfig, ViewMode, FileType } from '@/types';
import { generateEncryptionKey, encryptData, decryptData, combineEncryptedDataAndIV, extractEncryptedDataAndIV, exportKey, importKey } from '@/lib/encryption';
import { useToast } from '@/components/ui/use-toast';

// Helper to determine file type from extension
const getFileType = (extension: string): FileType => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const documentExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'];
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'];
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
  const codeExts = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go'];
  
  const ext = extension.toLowerCase();
  
  if (imageExts.includes(ext)) return 'image';
  if (documentExts.includes(ext)) return 'document';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (archiveExts.includes(ext)) return 'archive';
  if (codeExts.includes(ext)) return 'code';
  if (ext === 'pdf') return 'pdf';
  
  return 'other';
};

// Convert file size to human-readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const useFileManager = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ type: 'name', direction: 'asc' });
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'grid', showDetails: true });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Initialize encryption key
  useEffect(() => {
    const initializeEncryption = async () => {
      try {
        // In a real app, we would load the key from secure storage
        // For demo purposes, we'll generate a new key each time
        const key = await generateEncryptionKey();
        setEncryptionKey(key);
      } catch (error) {
        console.error('Failed to initialize encryption:', error);
        toast({
          variant: 'destructive',
          title: 'Encryption Error',
          description: 'Failed to initialize encryption.'
        });
      }
    };
    
    initializeEncryption();
  }, [toast]);

  // Initialize root folder if none exists
  useEffect(() => {
    if (folders.length === 0) {
      setFolders([
        {
          id: 'root',
          name: 'Root',
          path: '/',
          files: [],
          subfolders: [],
          parent: null
        }
      ]);
    }
  }, [folders]);

  // Get current folder
  const getCurrentFolder = useCallback((): Folder | undefined => {
    return folders.find(folder => folder.path === currentPath);
  }, [folders, currentPath]);

  // Get files in current folder
  const getCurrentFiles = useCallback((): FileItem[] => {
    const currentFolder = getCurrentFolder();
    if (!currentFolder) return [];
    
    let folderFiles = [...currentFolder.files];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      folderFiles = folderFiles.filter(file => 
        file.name.toLowerCase().includes(query) || 
        file.type.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    folderFiles.sort((a, b) => {
      let comparison = 0;
      
      switch (sortConfig.type) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'date':
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    
    return folderFiles;
  }, [folders, currentPath, searchQuery, sortConfig, getCurrentFolder]);

  // Get current subfolders
  const getCurrentSubfolders = useCallback((): Folder[] => {
    const currentFolder = getCurrentFolder();
    if (!currentFolder) return [];
    
    let subfolders = [...currentFolder.subfolders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      subfolders = subfolders.filter(folder => 
        folder.name.toLowerCase().includes(query)
      );
    }
    
    // Sort subfolders by name
    subfolders.sort((a, b) => {
      return sortConfig.direction === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    });
    
    return subfolders;
  }, [folders, currentPath, searchQuery, sortConfig, getCurrentFolder]);

  // Create a new folder
  const createFolder = useCallback((name: string) => {
    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid Name',
        description: 'Folder name cannot be empty.'
      });
      return;
    }
    
    setFolders(prevFolders => {
      // Find the current folder
      const currentFolderIndex = prevFolders.findIndex(f => f.path === currentPath);
      if (currentFolderIndex === -1) return prevFolders;
      
      const currentFolder = prevFolders[currentFolderIndex];
      
      // Check if folder already exists
      if (currentFolder.subfolders.some(f => f.name === name)) {
        toast({
          variant: 'destructive',
          title: 'Folder Already Exists',
          description: `A folder named "${name}" already exists.`
        });
        return prevFolders;
      }
      
      // Create new folder
      const newFolderId = generateId();
      const newFolderPath = currentPath === '/' 
        ? `/${name}` 
        : `${currentPath}/${name}`;
      
      const newFolder: Folder = {
        id: newFolderId,
        name,
        path: newFolderPath,
        files: [],
        subfolders: [],
        parent: currentFolder.id
      };
      
      // Update current folder's subfolders
      const updatedFolder = {
        ...currentFolder,
        subfolders: [...currentFolder.subfolders, newFolder]
      };
      
      // Create new folders array with the updated folder and new folder
      const updatedFolders = [
        ...prevFolders.slice(0, currentFolderIndex),
        updatedFolder,
        ...prevFolders.slice(currentFolderIndex + 1),
        newFolder
      ];
      
      toast({
        title: 'Folder Created',
        description: `Folder "${name}" created successfully.`
      });
      
      return updatedFolders;
    });
  }, [currentPath, toast]);

  // Upload files
  const uploadFiles = useCallback(async (fileList: FileList) => {
    if (!encryptionKey) {
      toast({
        variant: 'destructive',
        title: 'Encryption Error',
        description: 'Encryption key not available. Please refresh and try again.'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const currentFolder = getCurrentFolder();
      if (!currentFolder) throw new Error('Current folder not found');
      
      const filesArray = Array.from(fileList);
      const newFiles: FileItem[] = [];
      
      for (const file of filesArray) {
        const extension = file.name.split('.').pop() || '';
        const fileId = generateId();
        
        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        
        // Encrypt file data
        const { encrypted, iv } = await encryptData(arrayBuffer, encryptionKey);
        
        // Combine encrypted data and IV for storage
        const securedData = combineEncryptedDataAndIV(encrypted, iv);
        
        // Create a Blob from the encrypted data
        const encryptedBlob = new Blob([securedData], { type: 'application/octet-stream' });
        
        newFiles.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: getFileType(extension),
          lastModified: new Date(file.lastModified),
          encrypted: true,
          path: currentPath,
          extension,
          blob: encryptedBlob
        });
      }
      
      setFolders(prevFolders => {
        // Find the current folder
        const folderIndex = prevFolders.findIndex(f => f.path === currentPath);
        if (folderIndex === -1) return prevFolders;
        
        const folder = prevFolders[folderIndex];
        
        // Update folder with new files
        const updatedFolder = {
          ...folder,
          files: [...folder.files, ...newFiles]
        };
        
        return [
          ...prevFolders.slice(0, folderIndex),
          updatedFolder,
          ...prevFolders.slice(folderIndex + 1)
        ];
      });
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      toast({
        title: 'Files Uploaded',
        description: `${newFiles.length} file(s) uploaded successfully.`
      });
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Failed to upload files. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPath, encryptionKey, getCurrentFolder, toast]);

  // Download a file
  const downloadFile = useCallback(async (fileId: string) => {
    if (!encryptionKey) {
      toast({
        variant: 'destructive',
        title: 'Encryption Error',
        description: 'Encryption key not available. Please refresh and try again.'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Find the file
      const fileToDownload = files.find(f => f.id === fileId);
      if (!fileToDownload || !fileToDownload.blob) {
        throw new Error('File not found');
      }
      
      // Get encrypted data
      const encryptedData = await fileToDownload.blob.arrayBuffer();
      
      // Extract encrypted content and IV
      const { encryptedData: extracted, iv } = extractEncryptedDataAndIV(encryptedData);
      
      // Decrypt the data
      const decryptedData = await decryptData(extracted, encryptionKey, iv);
      
      // Create a download link
      const decryptedBlob = new Blob([decryptedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(decryptedBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileToDownload.name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: 'File Downloaded',
        description: `"${fileToDownload.name}" downloaded successfully.`
      });
    } catch (error) {
      console.error('Failed to download file:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Failed to download file. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [encryptionKey, files, toast]);

  // Delete items (files or folders)
  const deleteItems = useCallback((itemIds: string[]) => {
    if (itemIds.length === 0) return;
    
    setFolders(prevFolders => {
      let updatedFolders = [...prevFolders];
      
      // Handle file deletion
      const fileIds = itemIds.filter(id => files.some(f => f.id === id));
      if (fileIds.length > 0) {
        // Find the current folder
        const folderIndex = updatedFolders.findIndex(f => f.path === currentPath);
        if (folderIndex !== -1) {
          const folder = updatedFolders[folderIndex];
          
          // Remove the files from the folder
          const updatedFiles = folder.files.filter(f => !fileIds.includes(f.id));
          
          // Update the folder with the remaining files
          updatedFolders[folderIndex] = {
            ...folder,
            files: updatedFiles
          };
        }
      }
      
      // Handle folder deletion
      const folderIds = itemIds.filter(id => 
        !fileIds.includes(id) && prevFolders.some(f => f.id === id)
      );
      
      if (folderIds.length > 0) {
        // Get all subpaths of folders to be deleted
        const foldersToDelete = folderIds.map(id => {
          const folder = prevFolders.find(f => f.id === id);
          return folder ? folder.path : '';
        }).filter(Boolean);
        
        // For each folder to delete, we need to also remove all subfolders
        const allPathsToDelete = foldersToDelete.reduce((paths, folderPath) => {
          // Find all folders that have this path as a prefix
          const subfolders = prevFolders
            .filter(f => f.path.startsWith(folderPath))
            .map(f => f.path);
          
          return [...paths, ...subfolders];
        }, foldersToDelete);
        
        // Remove folders and update parent subfolders
        updatedFolders = updatedFolders.filter(folder => {
          const shouldKeep = !allPathsToDelete.includes(folder.path);
          
          // If we're keeping this folder, check if we need to update its subfolders
          if (shouldKeep && folder.subfolders.some(sub => folderIds.includes(sub.id))) {
            folder.subfolders = folder.subfolders.filter(sub => !folderIds.includes(sub.id));
          }
          
          return shouldKeep;
        });
      }
      
      // Clean up selected items
      setSelectedItems([]);
      
      // Show success message
      toast({
        title: 'Items Deleted',
        description: `${itemIds.length} item(s) deleted successfully.`
      });
      
      return updatedFolders;
    });
    
    // Update files state by removing deleted files
    setFiles(prevFiles => prevFiles.filter(file => !itemIds.includes(file.id)));
  }, [currentPath, files, toast]);

  // Navigate to a folder
  const navigateToFolder = useCallback((path: string) => {
    // Validate path
    if (!folders.some(folder => folder.path === path)) {
      console.error(`Folder path not found: ${path}`);
      return;
    }
    
    setCurrentPath(path);
    setSelectedItems([]);
    setSelectedFile(null);
  }, [folders]);

  // Navigate to parent folder
  const navigateToParent = useCallback(() => {
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    
    const parentPath = pathParts.length === 0 ? '/' : `/${pathParts.join('/')}`;
    navigateToFolder(parentPath);
  }, [currentPath, navigateToFolder]);

  // Get file preview URL
  const getFilePreviewUrl = useCallback(async (fileId: string) => {
    if (!encryptionKey) {
      toast({
        variant: 'destructive',
        title: 'Encryption Error',
        description: 'Encryption key not available.'
      });
      return null;
    }
    
    try {
      const fileToPreview = files.find(f => f.id === fileId);
      if (!fileToPreview || !fileToPreview.blob) {
        throw new Error('File not found');
      }
      
      // For non-previewable files, just return null
      const previewableTypes = ['image', 'pdf', 'video', 'audio'];
      if (!previewableTypes.includes(fileToPreview.type)) {
        return null;
      }
      
      // Get encrypted data
      const encryptedData = await fileToPreview.blob.arrayBuffer();
      
      // Extract encrypted content and IV
      const { encryptedData: extracted, iv } = extractEncryptedDataAndIV(encryptedData);
      
      // Decrypt the data
      const decryptedData = await decryptData(extracted, encryptionKey, iv);
      
      // Create blob URL for preview
      let mimeType = 'application/octet-stream';
      
      switch (fileToPreview.type) {
        case 'image':
          mimeType = `image/${fileToPreview.extension}`;
          break;
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'video':
          mimeType = `video/${fileToPreview.extension}`;
          break;
        case 'audio':
          mimeType = `audio/${fileToPreview.extension}`;
          break;
      }
      
      const decryptedBlob = new Blob([decryptedData], { type: mimeType });
      return URL.createObjectURL(decryptedBlob);
    } catch (error) {
      console.error('Failed to get preview URL:', error);
      toast({
        variant: 'destructive',
        title: 'Preview Failed',
        description: 'Failed to generate preview. Please try again.'
      });
      return null;
    }
  }, [encryptionKey, files, toast]);

  // Return the hook's interface
  return {
    files,
    folders,
    currentPath,
    selectedItems,
    sortConfig,
    viewMode,
    searchQuery,
    loading,
    selectedFile,
    getCurrentFiles,
    getCurrentSubfolders,
    getCurrentFolder,
    createFolder,
    uploadFiles,
    downloadFile,
    deleteItems,
    navigateToFolder,
    navigateToParent,
    setSelectedItems,
    setSortConfig,
    setViewMode,
    setSearchQuery,
    setSelectedFile,
    getFilePreviewUrl,
    formatFileSize,
  };
};
