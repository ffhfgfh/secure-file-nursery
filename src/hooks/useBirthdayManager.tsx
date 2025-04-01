
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Person, Gift, GiftIdea, BirthdayEvent, ReminderSettings } from '@/types/birthday';

// Helper to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Helper to calculate days until birthday this year
const calculateDaysUntil = (birthday: Date): number => {
  const today = new Date();
  const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  
  // If the birthday has passed this year, calculate for next year
  if (birthdayThisYear < today) {
    birthdayThisYear.setFullYear(birthdayThisYear.getFullYear() + 1);
  }
  
  const differenceInTime = birthdayThisYear.getTime() - today.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
};

// Helper to get upcoming birthdays
const getUpcomingBirthdays = (people: Person[], limit?: number): BirthdayEvent[] => {
  const events = people.map(person => {
    const daysUntil = calculateDaysUntil(new Date(person.birthday));
    return {
      personId: person.id,
      personName: person.name,
      date: new Date(person.birthday),
      daysUntil,
      relationship: person.relationship,
      avatar: person.avatar
    };
  });
  
  // Sort by days until birthday
  events.sort((a, b) => a.daysUntil - b.daysUntil);
  
  // Limit results if specified
  return limit ? events.slice(0, limit) : events;
};

export const useBirthdayManager = () => {
  const { toast } = useToast();
  const [people, setPeople] = useState<Person[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    userId: 'current-user', // In a real app, this would be the actual user ID
    daysInAdvance: 7,
    notificationMethod: 'app',
    enabled: true
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load sample data initially
  useEffect(() => {
    // In a real application, this would fetch from a database
    const today = new Date();
    const samplePeople: Person[] = [
      {
        id: 'p1',
        name: 'John Doe',
        birthday: new Date(today.getFullYear() - 30, today.getMonth(), today.getDate() + 5),
        relationship: 'Friend',
        gender: 'male',
        interests: ['Technology', 'Music', 'Basketball'],
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
      },
      {
        id: 'p2',
        name: 'Jane Smith',
        birthday: new Date(today.getFullYear() - 28, today.getMonth(), today.getDate() + 15),
        relationship: 'Sister',
        gender: 'female',
        interests: ['Art', 'Travel', 'Photography'],
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random'
      },
      {
        id: 'p3',
        name: 'Michael Johnson',
        birthday: new Date(today.getFullYear() - 35, today.getMonth() + 1, 10),
        relationship: 'Colleague',
        gender: 'male',
        interests: ['Books', 'Cooking', 'Hiking'],
        avatar: 'https://ui-avatars.com/api/?name=Michael+Johnson&background=random'
      }
    ];
    
    const sampleGifts: Gift[] = [
      {
        id: 'g1',
        personId: 'p1',
        name: 'Wireless Headphones',
        description: 'Sony WH-1000XM4',
        price: 299.99,
        year: today.getFullYear() - 1,
        source: 'Amazon',
        imageUrl: 'https://placehold.co/300x300?text=Headphones'
      },
      {
        id: 'g2',
        personId: 'p2',
        name: 'Art Set',
        description: 'Professional Drawing Kit',
        price: 89.99,
        year: today.getFullYear() - 1,
        source: 'Flipkart',
        imageUrl: 'https://placehold.co/300x300?text=Art+Set'
      }
    ];
    
    setPeople(samplePeople);
    setGifts(sampleGifts);
  }, []);
  
  // Add a new person
  const addPerson = useCallback((person: Omit<Person, 'id'>) => {
    const newPerson: Person = {
      ...person,
      id: generateId()
    };
    
    setPeople(prev => [...prev, newPerson]);
    
    toast({
      title: 'Person Added',
      description: `${person.name} has been added to your birthday list.`
    });
    
    return newPerson;
  }, [toast]);
  
  // Update an existing person
  const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
    setPeople(prev => prev.map(person => 
      person.id === id ? { ...person, ...updates } : person
    ));
    
    toast({
      title: 'Person Updated',
      description: 'The person details have been updated.'
    });
  }, [toast]);
  
  // Remove a person
  const removePerson = useCallback((id: string) => {
    setPeople(prev => prev.filter(person => person.id !== id));
    
    // Also remove their gifts
    setGifts(prev => prev.filter(gift => gift.personId !== id));
    
    toast({
      title: 'Person Removed',
      description: 'The person and their gift history have been removed.'
    });
  }, [toast]);
  
  // Add a new gift
  const addGift = useCallback((gift: Omit<Gift, 'id'>) => {
    const newGift: Gift = {
      ...gift,
      id: generateId()
    };
    
    setGifts(prev => [...prev, newGift]);
    
    toast({
      title: 'Gift Added',
      description: `${gift.name} has been added to the gift history.`
    });
    
    return newGift;
  }, [toast]);
  
  // Remove a gift
  const removeGift = useCallback((id: string) => {
    setGifts(prev => prev.filter(gift => gift.id !== id));
    
    toast({
      title: 'Gift Removed',
      description: 'The gift has been removed from the history.'
    });
  }, [toast]);
  
  // Update reminder settings
  const updateReminderSettings = useCallback((settings: Partial<ReminderSettings>) => {
    setReminderSettings(prev => ({ ...prev, ...settings }));
    
    toast({
      title: 'Settings Updated',
      description: 'Your reminder settings have been updated.'
    });
  }, [toast]);
  
  // Get gift recommendations
  const getGiftRecommendations = useCallback(async (personId: string, budget?: number) => {
    setIsLoading(true);
    
    try {
      const person = people.find(p => p.id === personId);
      if (!person) throw new Error('Person not found');
      
      const previousGifts = gifts.filter(g => g.personId === personId);
      
      // In a real app, this would call an AI model or API
      // For now, we'll simulate with a timeout and static data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock gift ideas based on interests
      const interests = person.interests || [];
      const mockGiftIdeas: GiftIdea[] = [
        {
          id: generateId(),
          name: 'Premium Headphones',
          description: 'Noise-cancelling headphones for music lovers',
          price: 199.99,
          category: 'Electronics',
          imageUrl: 'https://placehold.co/300x300?text=Headphones',
          purchaseLink: 'https://amazon.com',
          score: 0.95,
          platform: 'Amazon'
        },
        {
          id: generateId(),
          name: 'Fitness Tracker',
          description: 'Track steps, sleep, and more',
          price: 79.99,
          category: 'Gadgets',
          imageUrl: 'https://placehold.co/300x300?text=Fitness+Tracker',
          purchaseLink: 'https://amazon.com',
          score: 0.85,
          platform: 'Amazon'
        },
        {
          id: generateId(),
          name: 'Artistic Sketchbook',
          description: 'Premium quality paper for artists',
          price: 29.99,
          category: 'Art',
          imageUrl: 'https://placehold.co/300x300?text=Sketchbook',
          purchaseLink: 'https://flipkart.com',
          score: 0.78,
          platform: 'Flipkart'
        }
      ];
      
      setGiftIdeas(mockGiftIdeas);
      
      toast({
        title: 'Recommendations Ready',
        description: `Found ${mockGiftIdeas.length} gift ideas for ${person.name}.`
      });
      
      return mockGiftIdeas;
    } catch (error) {
      console.error('Failed to get gift recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get gift recommendations. Please try again.'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [people, gifts, toast]);
  
  // Get upcoming birthdays
  const getUpcoming = useCallback((limit?: number) => {
    return getUpcomingBirthdays(people, limit);
  }, [people]);
  
  // Get person's previous gifts
  const getPersonGifts = useCallback((personId: string) => {
    return gifts.filter(gift => gift.personId === personId);
  }, [gifts]);
  
  // Get birthdays for this month
  const getBirthdaysThisMonth = useCallback(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    
    return people.filter(person => {
      const birthday = new Date(person.birthday);
      return birthday.getMonth() === currentMonth;
    });
  }, [people]);
  
  return {
    people,
    gifts,
    giftIdeas,
    reminderSettings,
    isLoading,
    addPerson,
    updatePerson,
    removePerson,
    addGift,
    removeGift,
    updateReminderSettings,
    getGiftRecommendations,
    getUpcoming,
    getPersonGifts,
    getBirthdaysThisMonth,
    calculateDaysUntil
  };
};
