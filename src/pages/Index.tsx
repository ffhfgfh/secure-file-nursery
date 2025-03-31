
import { useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FileList from '@/components/FileList';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Welcome notification
    toast({
      title: "Welcome to SecureVault",
      description: "Your files are protected with end-to-end encryption",
    });
  }, [toast]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <FileList />
      </div>
    </div>
  );
};

export default Index;
