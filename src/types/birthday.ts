
import { User } from './index';

export interface Person {
  id: string;
  name: string;
  birthday: Date;
  relationship: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  interests?: string[];
  preferences?: string[];
  avatar?: string;
}

export interface Gift {
  id: string;
  personId: string;
  name: string;
  description?: string;
  price: number;
  year: number;
  source?: string;
  imageUrl?: string;
  purchaseLink?: string;
}

export interface GiftIdea {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  purchaseLink: string;
  score: number; // Relevance score
  platform: 'Amazon' | 'Flipkart' | 'Myntra' | 'Nykaa' | 'Other';
}

export interface ReminderSettings {
  userId: string;
  daysInAdvance: number; // How many days before to send reminder
  notificationMethod: 'email' | 'app' | 'both';
  enabled: boolean;
}

export interface BirthdayEvent {
  personId: string;
  personName: string;
  date: Date;
  daysUntil: number;
  relationship: string;
  avatar?: string;
}

export interface GiftRecommendationRequest {
  person: Person;
  budget?: number;
  occasion: 'birthday' | 'anniversary' | 'other';
  previousGifts?: Gift[];
}

export interface BirthdayCalendarDay {
  date: Date;
  events: BirthdayEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface BirthdayCalendarMonth {
  month: number;
  year: number;
  days: BirthdayCalendarDay[];
}
