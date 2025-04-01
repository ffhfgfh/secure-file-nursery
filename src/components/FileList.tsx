import { useState, useCallback } from 'react';
import { useFileManager } from '@/hooks/useFileManager';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft, 
  FolderOpen, 
  Grid, 
  List, 
  SortAsc, 
  ArrowDownAZ, 
  ArrowUpAZ, 
  Clock, 
  FileIcon,
  Download,
  Trash2,
  Share,
  FolderPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import FileItem from './FileItem';
import SearchBar from './SearchBar';
import { SortConfig, ViewMode, Folder } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from './FileUpload';
import FilePreview from './FilePreview';
import EmptyState from './EmptyState';

const FileList = () => {
  const { 
    getCurrentFiles, 
    getCurrentSubfolders, 
    currentPath, 
    navigateToFolder, 
    navigateToParent, 
    selectedItems, 
    setSelectedItems, 
    sortConfig, 
    setSortConfig,
    viewMode,
    setViewMode,
    downloadFile,
    deleteItems,
    selectedFile,
    createFolder
  } = useFileManager();
  
  const [newFolderName, setNewFolderName] = useState('');
  
  const files = getCurrentFiles();
  const subfolders = getCurrentSubfolders();
  
  const toggleView = useCallback((type: 'grid' | 'list') => {
    setViewMode(prev => ({ ...prev, type }));
  }, [setViewMode]);
  
  const handleSortChange = useCallback((type: SortConfig['type']) => {
    setSortConfig(prev => {
      if (prev.type === type) {
        return { ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { type, direction: 'asc' };
    });
  }, [setSortConfig]);
  
  const handleItemClick = useCallback((id: string, isFolder: boolean) => {
    if (isFolder) {
      const folder = subfolders.find(f => f.id === id);
      if (folder) {
        navigateToFolder(folder.path);
      }
    } else {
      setSelectedItems(prev => {
        if (prev.includes(id)) {
          return prev.filter(itemId => itemId !== id);
        }
        return [...prev, id];
      });
    }
  }, [navigateToFolder, setSelectedItems, subfolders]);
  
  const handleFileDoubleClick = useCallback((id: string) => {
    downloadFile(id);
  }, [downloadFile]);
  
  const handleBulkDownload = useCallback(() => {
    selectedItems.forEach(id => {
      downloadFile(id);
    });
  }, [downloadFile, selectedItems]);
  
  const handleBulkDelete = useCallback(() => {
    deleteItems(selectedItems);
  }, [deleteItems, selectedItems]);
  
  const getBreadcrumbs = useCallback(() => {
    if (currentPath === '/') {
      return [{ name: 'Home', path: '/' }];
    }
    
    const segments = currentPath.split('/').filter(Boolean);
    let currentSegmentPath = '';
    
    return [
      { name: 'Home', path: '/' },
      ...segments.map(segment => {
        currentSegmentPath += `/${segment}`;
        return {
          name: segment,
          path: currentSegmentPath
        };
      })
    ];
  }, [currentPath]);
  
  const breadcrumbs = getBreadcrumbs();
  
  const pathParts = currentPath.split('/').filter(Boolean);
  const folderName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'Home';
  
  const isEmpty = files.length === 0 && subfolders.length === 0;
  
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden">
      {selectedFile ? (
        <FilePreview />
      ) : (
        <>
          <div className="flex items-center justify-between border-b bg-card p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={navigateToParent}
                disabled={currentPath === '/'}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    {index > 0 && <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />}
                    <Button
                      variant="link"
                      className={`h-auto p-1 ${index === breadcrumbs.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                      onClick={() => navigateToFolder(crumb.path)}
                    >
                      {crumb.name}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <SearchBar />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SortAsc className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={sortConfig.type}>
                    <DropdownMenuRadioItem value="name" onClick={() => handleSortChange('name')}>
                      {sortConfig.type === 'name' && sortConfig.direction === 'asc' ? (
                        <ArrowDownAZ className="mr-2 h-4 w-4" />
                      ) : (
                        <ArrowUpAZ className="mr-2 h-4 w-4" />
                      )}
                      Name
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="size" onClick={() => handleSortChange('size')}>
                      <FileIcon className="mr-2 h-4 w-4" />
                      Size
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date" onClick={() => handleSortChange('date')}>
                      <Clock className="mr-2 h-4 w-4" />
                      Date
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="type" onClick={() => handleSortChange('type')}>
                      <FileIcon className="mr-2 h-4 w-4" />
                      Type
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    {viewMode.type === 'grid' ? (
                      <Grid className="h-4 w-4" />
                    ) : (
                      <List className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleView('grid')}>
                    <Grid className="mr-2 h-4 w-4" />
                    Grid View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleView('list')}>
                    <List className="mr-2 h-4 w-4" />
                    List View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Tabs defaultValue="files" className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between border-b px-4">
              <TabsList>
                <TabsTrigger value="files" className="relative">
                  Files
                </TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.length} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={handleBulkDownload}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-destructive"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              )}
            </div>
            
            <TabsContent value="files" className="h-full overflow-y-auto p-4">
              {isEmpty ? (
                <EmptyState />
              ) : (
                <>
                  {subfolders.length > 0 && (
                    <div className="mb-6">
                      <h2 className="mb-3 text-lg font-semibold">Folders</h2>
                      <div className={viewMode.type === 'grid' ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'space-y-2'}>
                        {subfolders.map(folder => (
                          <div
                            key={folder.id}
                            className={`group flex cursor-pointer items-center rounded-lg border p-3 transition-all hover:border-primary ${selectedItems.includes(folder.id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                            onClick={() => handleItemClick(folder.id, true)}
                            onDoubleClick={() => navigateToFolder(folder.path)}
                          >
                            <FolderOpen className="mr-3 h-8 w-8 text-yellow-500" />
                            <div className="flex-1">
                              <p className="font-medium">{folder.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {folder.files.length} {folder.files.length === 1 ? 'file' : 'files'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {files.length > 0 && (
                    <div>
                      <h2 className="mb-3 text-lg font-semibold">Files</h2>
                      <div className={viewMode.type === 'grid' ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'space-y-2'}>
                        {files.map(file => (
                          <FileItem
                            key={file.id}
                            file={file}
                            isSelected={selectedItems.includes(file.id)}
                            view={viewMode.type}
                            onSelect={() => handleItemClick(file.id, false)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="upload" className="flex h-full flex-col items-center justify-center p-4">
              <FileUpload />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default FileList;
