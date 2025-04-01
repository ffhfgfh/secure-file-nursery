
import { useState } from 'react';
import { Person } from '@/types/birthday';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PersonFormProps {
  person?: Partial<Person>;
  onClose: () => void;
  onSave: (person: Omit<Person, 'id'>) => void;
}

const PersonForm = ({ person, onClose, onSave }: PersonFormProps) => {
  const [name, setName] = useState(person?.name || '');
  const [relationship, setRelationship] = useState(person?.relationship || '');
  const [birthday, setBirthday] = useState(
    person?.birthday 
      ? new Date(person.birthday).toISOString().split('T')[0] 
      : ''
  );
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(person?.gender || 'other');
  const [interests, setInterests] = useState(person?.interests?.join(', ') || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !relationship || !birthday) {
      return; // Simple validation
    }
    
    const newPerson: Omit<Person, 'id'> = {
      name,
      relationship,
      birthday: new Date(birthday),
      gender,
      interests: interests.split(',').map(i => i.trim()).filter(Boolean),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
    
    onSave(newPerson);
  };
  
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'male' || value === 'female' || value === 'other') {
      setGender(value);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {person ? 'Edit Person' : 'Add New Person'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Friend, Family, etc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={gender}
              onChange={handleGenderChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other/Prefer not to say</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interests">Interests (comma separated)</Label>
            <Input
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Books, Travel, Music"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonForm;
