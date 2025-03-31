
import { useState, useEffect } from 'react';
import { useFileManager } from '@/hooks/useFileManager';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useFileManager();
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
  };
  
  const clearSearch = () => {
    setInputValue('');
    setSearchQuery('');
  };
  
  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search files and folders..."
        className="pl-10 pr-10"
      />
      {inputValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
          onClick={clearSearch}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </form>
  );
};

export default SearchBar;
