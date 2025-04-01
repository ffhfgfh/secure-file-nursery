
import { useState } from 'react';
import { useBirthdayManager } from '@/hooks/useBirthdayManager';
import { Person, BirthdayEvent, GiftIdea } from '@/types/birthday';
import UpcomingBirthdays from '@/components/birthdayReminder/UpcomingBirthdays';
import PersonForm from '@/components/birthdayReminder/PersonForm';
import GiftRecommendations from '@/components/birthdayReminder/GiftRecommendations';
import BirthdayCalendar from '@/components/birthdayReminder/BirthdayCalendar';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Gift, CalendarDays, Users, Settings } from 'lucide-react';

const BirthdayReminder = () => {
  const birthdayManager = useBirthdayManager();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  
  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
    // Load gift recommendations when a person is selected
    birthdayManager.getGiftRecommendations(person.id);
  };
  
  const upcomingBirthdays = birthdayManager.getUpcoming(5);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Birthday Reminder</h1>
            <p className="text-muted-foreground">
              Keep track of important birthdays and find the perfect gifts
            </p>
          </div>
          <Button onClick={() => setShowAddPerson(true)}>
            Add Person
          </Button>
        </div>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <UpcomingBirthdays 
                  birthdays={upcomingBirthdays} 
                  onPersonSelect={handlePersonSelect}
                />
              </div>
              <div className="md:col-span-2">
                {selectedPerson ? (
                  <GiftRecommendations 
                    person={selectedPerson}
                    giftIdeas={birthdayManager.giftIdeas}
                    isLoading={birthdayManager.isLoading}
                    previousGifts={birthdayManager.getPersonGifts(selectedPerson.id)}
                  />
                ) : (
                  <div className="rounded-lg border border-border p-8 text-center">
                    <h3 className="text-xl font-semibold mb-2">Select a Person</h3>
                    <p className="text-muted-foreground">
                      Select a person from the list to see gift recommendations
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <BirthdayCalendar 
              people={birthdayManager.people}
              onPersonSelect={handlePersonSelect}
            />
          </TabsContent>
          
          <TabsContent value="people">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {birthdayManager.people.map(person => (
                <div 
                  key={person.id} 
                  className="rounded-lg border border-border p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handlePersonSelect(person)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                      {person.avatar ? (
                        <img 
                          src={person.avatar} 
                          alt={person.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                          {person.name.substring(0, 1)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{person.name}</h3>
                      <p className="text-sm text-muted-foreground">{person.relationship}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm">
                      <span className="font-medium">Birthday:</span> {new Date(person.birthday).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Days until:</span> {birthdayManager.calculateDaysUntil(new Date(person.birthday))}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {person.interests?.map((interest, i) => (
                      <span key={i} className="text-xs bg-accent px-2 py-0.5 rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">Reminder Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Remind me
                  </label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={birthdayManager.reminderSettings.daysInAdvance}
                    onChange={(e) => birthdayManager.updateReminderSettings({
                      daysInAdvance: parseInt(e.target.value)
                    })}
                  >
                    <option value="1">1 day before</option>
                    <option value="3">3 days before</option>
                    <option value="7">1 week before</option>
                    <option value="14">2 weeks before</option>
                    <option value="30">1 month before</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notification Method
                  </label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={birthdayManager.reminderSettings.notificationMethod}
                    onChange={(e) => birthdayManager.updateReminderSettings({
                      notificationMethod: e.target.value as 'email' | 'app' | 'both'
                    })}
                  >
                    <option value="app">App Only</option>
                    <option value="email">Email Only</option>
                    <option value="both">Both App and Email</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    className="mr-2"
                    checked={birthdayManager.reminderSettings.enabled}
                    onChange={(e) => birthdayManager.updateReminderSettings({
                      enabled: e.target.checked
                    })}
                  />
                  <label htmlFor="enabled" className="text-sm">
                    Enable birthday reminders
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {showAddPerson && (
        <PersonForm
          onClose={() => setShowAddPerson(false)}
          onSave={(person) => {
            birthdayManager.addPerson(person);
            setShowAddPerson(false);
          }}
        />
      )}
    </div>
  );
};

export default BirthdayReminder;
