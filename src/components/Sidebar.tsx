
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileArchive,
  FileImage,
  FileText,
  FileLock,
  FolderLock,
  FolderOpen,
  Star,
  Trash2,
  Home,
  Plus,
  UploadCloud
} from 'lucide-react';
import { useFileManager } from '@/hooks/useFileManager';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useRef } from 'react';

const Sidebar = () => {
  const { navigateToFolder, createFolder, uploadFiles } = useFileManager();
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFolder = useCallback(() => {
    if (newFolderName.trim()) {
      createFolder(newFolderName);
      setNewFolderName('');
    }
  }, [createFolder, newFolderName]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploadFiles]);

  const triggerFileUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <aside className="flex h-[calc(100vh-4rem)] w-60 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col gap-1 p-4">
        <Button
          variant="outline"
          className="justify-start bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
          onClick={triggerFileUpload}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          multiple
        />
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="justify-start">
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleCreateFolder}>Create</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-2">
        <div className="space-y-1 py-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => navigateToFolder('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
          >
            <Star className="mr-2 h-4 w-4" />
            Favorites
          </Button>
        </div>

        <div className="py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
            FILE TYPES
          </h3>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
            >
              <FileImage className="mr-2 h-4 w-4" />
              Images
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
            >
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
            >
              <FileArchive className="mr-2 h-4 w-4" />
              Archives
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
            >
              <FileLock className="mr-2 h-4 w-4" />
              Encrypted
            </Button>
          </div>
        </div>

        <div className="py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
            STORAGE
          </h3>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              All Files
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
            >
              <FolderLock className="mr-2 h-4 w-4" />
              Secure Vault
            </Button>
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Trash
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
