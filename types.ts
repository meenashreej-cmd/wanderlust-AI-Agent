export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TripInput {
  fromLocation: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  currency: 'USD' | 'INR';
  budgetType: 'total' | 'per_person';
  people: number;
  transport: 'flight' | 'train' | 'bus' | 'car';
  accommodationType: 'hotel' | 'airbnb';
  accommodationBudget: 'budget' | 'mid_range' | 'luxury';
  bookingPreference: 'auto_book' | 'suggest_only';
  tourGuide: boolean; // Added tour guide preference
  imageFile: File | null;
}

export interface ItineraryItem {
  id: string;
  time: string; // e.g. "Morning", "10:00 AM"
  activity: string;
  costEstimate: number;
  location: string;
  notes: string;
}

export interface DayPlan {
  day: number;
  date: string;
  theme: string;
  items: ItineraryItem[];
}

export interface TransportOption {
  id: string;
  type: string;
  provider: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cost: number;
  booked: boolean;
}

export interface AccommodationOption {
  id: string;
  name: string;
  type: string;
  location: string;
  costPerNight: number;
  totalCost: number;
  amenities: string[];
  rating: number;
  booked: boolean;
}

export interface FoodOption {
  id: string;
  name: string;
  cuisine: string;
  type: string; // e.g. "Fine Dining", "Street Food"
  location: string;
  costPerPerson: number;
  rating: number;
  booked: boolean;
}

export interface TripResult {
  tripId: string;
  destination: string;
  people: number;
  currency: 'USD' | 'INR';
  vibeAnalysis: string;
  status: 'draft' | 'saved' | 'booked';
  
  // Options provided by AI (always 3)
  transportOptions: TransportOption[];
  accommodationOptions: AccommodationOption[];
  foodOptions: FoodOption[];
  
  // Selections
  selectedTransportId: string;
  selectedAccommodationId: string;
  selectedFoodId: string;
  
  itinerary: DayPlan[];
  
  // Base estimates for variable costs
  estimatedCosts: {
    food: number;
    activities: number;
  };
}

export interface LogItem {
  type: 'info' | 'tool' | 'success' | 'error';
  message: string;
  timestamp: number;
}