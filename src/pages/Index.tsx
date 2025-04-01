
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FileList from '@/components/FileList';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

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
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-primary/5 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">My Apps</h2>
              <Link to="/birthday-reminder">
                <Button className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Birthday Reminders
                </Button>
              </Link>
            </div>
          </div>
          <FileList />
        </div>
      </div>
    </div>
  );
};

export default Index;
