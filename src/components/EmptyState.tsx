
import { FolderPlus, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFileManager } from '@/hooks/useFileManager';

const EmptyState = () => {
  const { createFolder } = useFileManager();
  const [newFolderName, setNewFolderName] = useState('');
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName);
      setNewFolderName('');
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mb-6 rounded-full bg-primary/10 p-6">
        <FolderPlus className="h-12 w-12 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">This folder is empty</h2>
      <p className="mb-6 max-w-md text-center text-muted-foreground">
        Upload files or create a new folder to get started with your secure file management.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="empty-folder-name">Folder Name</Label>
                <Input
                  id="empty-folder-name"
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
        
        <input
          type="file"
          ref={setFileInputRef}
          className="hidden"
          multiple
        />
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => fileInputRef?.click()}
        >
          <UploadCloud className="h-4 w-4" />
          Upload Files
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
