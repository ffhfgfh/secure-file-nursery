
import { useState, useMemo } from 'react';
import { Person, BirthdayCalendarMonth, BirthdayCalendarDay } from '@/types/birthday';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface BirthdayCalendarProps {
  people: Person[];
  onPersonSelect: (person: Person) => void;
}

const BirthdayCalendar = ({ people, onPersonSelect }: BirthdayCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generate calendar data for the current month
  const calendarMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Create a date for the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Calculate the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Generate calendar days
    const days: BirthdayCalendarDay[] = [];
    
    // Add days from previous month to fill the first week
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDayWeekday; i++) {
      const dayNumber = prevMonthDays - firstDayWeekday + i + 1;
      days.push({
        date: new Date(year, month - 1, dayNumber),
        events: [],
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    // Add days for the current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      
      // Find birthdays on this day
      const events = people
        .filter(person => {
          const birthday = new Date(person.birthday);
          return birthday.getDate() === i && birthday.getMonth() === month;
        })
        .map(person => ({
          personId: person.id,
          personName: person.name,
          date: new Date(person.birthday),
          daysUntil: 0, // Will be calculated later
          relationship: person.relationship,
          avatar: person.avatar
        }));
      
      days.push({
        date,
        events,
        isToday: 
          today.getDate() === i && 
          today.getMonth() === month && 
          today.getFullYear() === year,
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to fill the last week (up to 42 days total = 6 weeks)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        events: [],
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    return {
      month,
      year,
      days
    } as BirthdayCalendarMonth;
  }, [currentDate, people]);
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Navigate to current month
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Format month name
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Birthday Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
            >
              Today
            </Button>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-24 text-center">
                {monthName} {calendarMonth.year}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div 
              key={day} 
              className="text-center py-2 font-medium text-sm"
            >
              {day}
            </div>
          ))}
          
          {calendarMonth.days.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-24 p-1 border rounded text-sm
                ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground'}
                ${day.isToday ? 'border-primary' : 'border-border'}
              `}
            >
              <div className="text-right mb-1">
                {day.date.getDate()}
              </div>
              
              {day.events.map(event => (
                <div
                  key={event.personId}
                  className="bg-primary/10 text-primary p-1 rounded mb-1 cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => {
                    // Find the full person object and select it
                    const person = people.find(p => p.id === event.personId);
                    if (person) {
                      onPersonSelect(person);
                    }
                  }}
                >
                  {event.personName}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdayCalendar;
