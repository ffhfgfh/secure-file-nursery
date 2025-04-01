
import { BirthdayEvent } from '@/types/birthday';
import { Person } from '@/types/birthday';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Calendar } from 'lucide-react';

interface UpcomingBirthdaysProps {
  birthdays: BirthdayEvent[];
  onPersonSelect: (person: Person) => void;
}

const UpcomingBirthdays = ({ birthdays, onPersonSelect }: UpcomingBirthdaysProps) => {
  // Get full person object from the birthday event
  const handleSelect = (birthday: BirthdayEvent) => {
    // This is a simplified version - in a real app we'd fetch the full person
    // For demo purposes, we'll create a simple person object
    const person: Person = {
      id: birthday.personId,
      name: birthday.personName,
      birthday: birthday.date,
      relationship: birthday.relationship,
      // Add more properties as needed
    };
    
    onPersonSelect(person);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Birthdays
        </CardTitle>
      </CardHeader>
      <CardContent>
        {birthdays.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No upcoming birthdays
          </p>
        ) : (
          <ul className="space-y-4">
            {birthdays.map((birthday) => (
              <li 
                key={birthday.personId}
                onClick={() => handleSelect(birthday)}
                className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="bg-primary/10 p-2 rounded-full">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{birthday.personName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {birthday.relationship} • {birthday.date.toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-accent px-2 py-1 rounded text-sm font-medium">
                  {birthday.daysUntil === 0
                    ? "Today!"
                    : birthday.daysUntil === 1
                    ? "Tomorrow"
                    : `${birthday.daysUntil} days`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBirthdays;
