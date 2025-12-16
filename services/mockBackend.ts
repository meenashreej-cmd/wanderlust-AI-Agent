import { TripResult, User } from '../types';

// Mock Data
const DEFAULT_USER: User = {
  id: 'user_123',
  name: 'Alice Traveler',
  email: 'alice@example.com',
};

// Local Storage Keys - Versioned to avoid conflicts
const TRIPS_KEY = 'wanderlust_trips_v2';
const USERS_KEY = 'wanderlust_users_v2';

// Helper to get users from storage
const getStoredUsers = (): Record<string, User & { password: string }> => {
  try {
    const usersStr = localStorage.getItem(USERS_KEY);
    if (!usersStr) return {};
    const parsed = JSON.parse(usersStr);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed;
  } catch (e) {
    console.error("Failed to parse users from local storage", e);
    // If corrupted, clear it to allow new registrations
    localStorage.removeItem(USERS_KEY);
    return {};
  }
};

export const mockAuth = async (userId: string, password: string): Promise<User | null> => {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Faster auth
  
  const normalizedId = userId.toLowerCase().trim();
  const users = getStoredUsers();
  const storedUser = users[normalizedId];

  console.log(`[MockAuth] Attempting login for: ${normalizedId}. Found: ${!!storedUser}`);

  // 1. Check registered users
  if (storedUser) {
    if (storedUser.password === password) {
       console.log('[MockAuth] Password matched.');
       const { password: _, ...userProfile } = storedUser;
       return userProfile;
    } else {
       console.log('[MockAuth] Password mismatch.');
    }
  }

  // 2. Fallback for default demo user (only if not overridden in storage)
  if (normalizedId === 'user_123' && password === 'password' && !storedUser) {
    console.log('[MockAuth] Using default demo user.');
    return { ...DEFAULT_USER, id: userId }; // Return original casing for display if needed
  }

  return null;
};

export const mockRegister = async (name: string, email: string, userId: string, password: string): Promise<User | null> => {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Faster register

  const normalizedId = userId.toLowerCase().trim();
  const users = getStoredUsers();

  if (users[normalizedId]) {
    console.log(`[MockRegister] User ${normalizedId} already exists.`);
    return null; // User already exists
  }

  const newUser = {
    id: userId, // Store original casing for display
    name,
    email,
    password
  };

  users[normalizedId] = newUser;
  try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      console.log(`[MockRegister] Registered ${normalizedId} successfully.`);
  } catch (e) {
      console.error("Failed to save user to local storage", e);
      return null;
  }

  const { password: _, ...userProfile } = newUser;
  return userProfile;
};

export const fetchUserTrips = async (userId: string): Promise<TripResult[]> => {
  await new Promise((resolve) => setTimeout(resolve, 50)); // Instant load
  const normalizedId = userId.toLowerCase().trim();
  const stored = localStorage.getItem(`${TRIPS_KEY}_${normalizedId}`);
  return stored ? JSON.parse(stored) : [];
};

export const saveTrip = async (userId: string, trip: TripResult): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 50)); // Instant save
  const normalizedId = userId.toLowerCase().trim();
  const currentTrips = await fetchUserTrips(normalizedId);
  
  // Update if exists, else add new
  const existingIndex = currentTrips.findIndex(t => t.tripId === trip.tripId);
  let updatedTrips;
  if (existingIndex >= 0) {
    updatedTrips = [...currentTrips];
    updatedTrips[existingIndex] = { ...trip, status: 'saved' };
  } else {
    updatedTrips = [{ ...trip, status: 'saved' }, ...currentTrips];
  }
  localStorage.setItem(`${TRIPS_KEY}_${normalizedId}`, JSON.stringify(updatedTrips));
};

// --- Mock "Tool" APIs with Realistic Data ---

const getRandomPrice = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export const searchTransportAPI = async (from: string, to: string, type: string) => {
  console.log(`[API] Searching ${type} from ${from} to ${to}`);
  await new Promise((resolve) => setTimeout(resolve, 100)); // Fast API response
  
  // Basic heuristic to detect Indian context for realistic providers
  const isIndia = (str: string) => /india|delhi|mumbai|bangalore|goa|chennai|kolkata|hyderabad/i.test(str);
  const indianContext = isIndia(from) || isIndia(to);

  // Realistic price generation based on context
  let basePrice = 0;
  if (type === 'flight') {
    basePrice = indianContext ? getRandomPrice(4000, 12000) : getRandomPrice(200, 800);
  } else if (type === 'train') {
    basePrice = indianContext ? getRandomPrice(800, 3500) : getRandomPrice(50, 150);
  } else if (type === 'bus') {
    basePrice = indianContext ? getRandomPrice(500, 2000) : getRandomPrice(20, 80);
  } else { // car
    basePrice = indianContext ? getRandomPrice(2500, 8000) : getRandomPrice(60, 200);
  }

  const getProviders = (mode: string, contextIndia: boolean) => {
    if (mode === 'flight') {
      return contextIndia 
        ? ['IndiGo', 'Air India', 'Vistara'] 
        : ['Emirates', 'Lufthansa', 'British Airways'];
    }
    if (mode === 'train') {
      return contextIndia 
        ? ['Vande Bharat Exp', 'Rajdhani Express', 'Shatabdi Express'] 
        : ['EuroStar', 'Amtrak', 'TGV'];
    }
    if (mode === 'bus') {
      return contextIndia
        ? ['Zingbus', 'IntrCity SmartBus', 'KSRTC Volvo']
        : ['FlixBus', 'Greyhound', 'Megabus'];
    }
    return ['Hertz', 'Avis', 'Enterprise']; // car
  };

  const providers = getProviders(type, indianContext);
  
  return {
    options: [
      { 
        id: 't_1', 
        provider: providers[0], 
        cost: basePrice, 
        duration: '2h 30m', 
        type: type, 
        departureTime: '08:00 AM', 
        arrivalTime: '10:30 AM',
        booked: false 
      },
      { 
        id: 't_2', 
        provider: providers[1], 
        cost: Math.floor(basePrice * 1.2), 
        duration: '2h 15m', 
        type: type, 
        departureTime: '06:00 AM', 
        arrivalTime: '08:15 AM',
        booked: false 
      },
      { 
        id: 't_3', 
        provider: providers[2], 
        cost: Math.floor(basePrice * 0.85), 
        duration: '3h 15m', 
        type: type, 
        departureTime: '09:00 PM', 
        arrivalTime: '12:15 AM',
        booked: false 
      },
    ]
  };
};

export const searchAccommodationAPI = async (dest: string, type: string, budgetLevel: string) => {
  console.log(`[API] Searching ${budgetLevel} ${type} in ${dest}`);
  await new Promise((resolve) => setTimeout(resolve, 100)); // Fast API response
  
  // Heuristic for currency scaling
  const isIndia = /india|delhi|mumbai|bangalore|goa/i.test(dest);
  
  let basePrice = 0;
  if (budgetLevel === 'luxury') {
      basePrice = isIndia ? getRandomPrice(15000, 35000) : getRandomPrice(300, 800);
  } else if (budgetLevel === 'mid_range') {
      basePrice = isIndia ? getRandomPrice(4000, 10000) : getRandomPrice(120, 250);
  } else {
      basePrice = isIndia ? getRandomPrice(1500, 3500) : getRandomPrice(60, 100);
  }
  
  return {
    options: [
      { 
        id: 'a_1',
        name: `Grand ${dest} ${type === 'hotel' ? 'Hotel' : 'Villa'}`, 
        type: type, 
        costPerNight: basePrice, 
        rating: 4.8, 
        address: 'City Center, Downtown', 
        amenities: ['Pool', 'Spa', 'Free WiFi', 'Breakfast'],
        booked: false 
      },
      { 
        id: 'a_2',
        name: `${dest} Boutique Stay`, 
        type: type, 
        costPerNight: Math.floor(basePrice * 0.85), 
        rating: 4.5, 
        address: 'Arts District', 
        amenities: ['Free WiFi', 'Rooftop Bar', 'Gym'],
        booked: false 
      },
      { 
        id: 'a_3',
        name: `Cozy Corner ${dest}`, 
        type: type, 
        costPerNight: Math.floor(basePrice * 0.65), 
        rating: 4.2, 
        address: 'Old Town', 
        amenities: ['Kitchenette', 'Self Check-in', 'WiFi'],
        booked: false 
      },
    ]
  };
};

export const searchFoodAPI = async (dest: string) => {
    console.log(`[API] Searching food in ${dest}`);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const isIndia = /india|delhi|mumbai|bangalore|goa|chennai|kolkata|hyderabad/i.test(dest);

    // Food options
    const options = [
        {
            id: 'f_1',
            name: isIndia ? 'The Spice Route' : 'Le Gourmet Parisien',
            cuisine: isIndia ? 'Indian Fine Dining' : 'French Contemporary',
            type: 'Fine Dining',
            location: 'City Center',
            costPerPerson: isIndia ? getRandomPrice(2500, 5000) : getRandomPrice(80, 150),
            rating: 4.9,
            booked: false
        },
        {
            id: 'f_2',
            name: isIndia ? 'Coastal Flavors' : 'The Local Bistro',
            cuisine: isIndia ? 'Seafood & Curry' : 'Modern Fusion',
            type: 'Casual Dining',
            location: 'Waterfront',
            costPerPerson: isIndia ? getRandomPrice(1000, 2000) : getRandomPrice(40, 80),
            rating: 4.6,
            booked: false
        },
        {
            id: 'f_3',
            name: isIndia ? 'Chaat Bazaar' : 'Street Corner Eats',
            cuisine: isIndia ? 'Street Food & Snacks' : 'Local Delicacies',
            type: 'Street Food',
            location: 'Market Square',
            costPerPerson: isIndia ? getRandomPrice(300, 800) : getRandomPrice(15, 30),
            rating: 4.7,
            booked: false
        }
    ];

    return { options };
};