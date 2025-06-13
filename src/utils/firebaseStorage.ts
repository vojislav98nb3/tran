import { database } from './firebase';
import { ref, set, get, remove, push, child } from 'firebase/database';
import { Language } from './types';

export interface RoutePrice {
  id: string;
  price: string;
  icon: string;
  priceDescription?: string;
  names: {
    sr: string;
    en: string;
    ru: string;
  };
  whatsappMessages: {
    sr: string;
    en: string;
    ru: string;
  };
}

// Default routes that will be used if no Firebase data exists
const defaultRoutes: RoutePrice[] = [
  {
    id: 'novi-sad-aerodrom',
    price: '6.000',
    icon: '✈️',
    priceDescription: 'po vozilu (do 3 osobe + 1500 po osobi)',
    names: {
      sr: 'Novi Sad ⇄ Aerodrom Nikola Tesla Beograd',
      en: 'Novi Sad ⇄ Belgrade Nikola Tesla Airport',
      ru: 'Нови Сад ⇄ Аэропорт Никола Тесла Белград'
    },
    whatsappMessages: {
      sr: 'Zdravo! Zainteresovan/a sam za aerodromski transfer Novi Sad - Aerodrom Beograd.',
      en: 'Hello! I am interested in airport transfer Novi Sad - Belgrade Airport.',
      ru: 'Здравствуйте! Меня интересует трансфер в аэропорт Нови Сад - Аэропорт Белград.'
    }
  },
  {
    id: 'novi-sad-temisvar',
    price: '12.000',
    icon: '🚗',
    priceDescription: 'po vozilu (do 4 osobe)',
    names: {
      sr: 'Novi Sad ⇄ Temišvar (Timișoara)',
      en: 'Novi Sad ⇄ Timișoara Airport',
      ru: 'Нови Сад ⇄ Аэропорт Тимишоара'
    },
    whatsappMessages: {
      sr: 'Zdravo! Zainteresovan/a sam za transfer Novi Sad - Temišvar.',
      en: 'Hello! I am interested in transfer Novi Sad - Timișoara.',
      ru: 'Здравствуйте! Меня интересует трансфер Нови Сад - Тимишоара.'
    }
  },
  {
    id: 'novi-sad-budimpesta',
    price: '23.500',
    icon: '🛫',
    priceDescription: 'po vozilu (do 4 osobe)',
    names: {
      sr: 'Novi Sad ⇄ Budimpešta Aerodrom',
      en: 'Novi Sad ⇄ Budapest Airport',
      ru: 'Нови Сад ⇄ Аэропорт Будапешт'
    },
    whatsappMessages: {
      sr: 'Zdravo! Zainteresovan/a sam za transfer Novi Sad - Budimpešta.',
      en: 'Hello! I am interested in transfer Novi Sad - Budapest.',
      ru: 'Здравствуйте! Меня интересует трансфер Нови Сад - Будапешт.'
    }
  },
  {
    id: 'novi-sad-nis',
    price: '15.000',
    icon: '🚙',
    priceDescription: 'po vozilu (do 4 osobe)',
    names: {
      sr: 'Novi Sad ⇄ Niš Konstantin Veliki',
      en: 'Novi Sad ⇄ Niš Airport',
      ru: 'Нови Сад ⇄ Аэропорт Ниш'
    },
    whatsappMessages: {
      sr: 'Zdravo! Zainteresovan/a sam za transfer Novi Sad - Niš.',
      en: 'Hello! I am interested in transfer Novi Sad - Niš.',
      ru: 'Здравствуйте! Меня интересует трансфер Нови Сад - Ниш.'
    }
  },
  {
    id: 'novi-sad-segedin',
    price: '8.000',
    icon: '🚐',
    priceDescription: 'po vozilu (do 4 osobe)',
    names: {
      sr: 'Novi Sad ⇄ Segedin (Szeged)',
      en: 'Novi Sad ⇄ Szeged',
      ru: 'Нови Сад ⇄ Сегед'
    },
    whatsappMessages: {
      sr: 'Zdravo! Zainteresovan/a sam za transfer Novi Sad - Segedin.',
      en: 'Hello! I am interested in transfer Novi Sad - Szeged.',
      ru: 'Здравствуйте! Меня интересует трансфер Нови Сад - Сегед.'
    }
  },
  {
    id: 'novi-sad-zagreb',
    price: '35.000',
    icon: '🛬',
    priceDescription: 'po vozilu (do 4 osobe)',
    names: {
      sr: 'Novi Sad ⇄ Zagreb Aerodrom',
      en: 'Novi Sad ⇄ Zagreb Airport',
      ru: 'Нови Сад ⇄ Аэропорт Загреб'
    },
    whatsappMessages: {
      sr: 'Zdravo! Zainteresovan/a sam za transfer Novi Sad - Zagreb.',
      en: 'Hello! I am interested in transfer Novi Sad - Zagreb.',
      ru: 'Здравствуйте! Меня интересует трансфер Нови Сад - Загреб.'
    }
  }
];

// Initialize default data in Firebase if it doesn't exist
export const initializeDefaultData = async (): Promise<void> => {
  try {
    const routesRef = ref(database, 'routes');
    const snapshot = await get(routesRef);
    
    if (!snapshot.exists()) {
      console.log('Initializing default routes in Firebase...');
      await set(routesRef, defaultRoutes);
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// Get prices from Firebase
export const getPrices = async (): Promise<RoutePrice[]> => {
  try {
    const routesRef = ref(database, 'routes');
    const snapshot = await get(routesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Array.isArray(data) ? data : Object.values(data);
    } else {
      // Initialize with default data if no data exists
      await initializeDefaultData();
      return defaultRoutes;
    }
  } catch (error) {
    console.error('Error loading prices from Firebase:', error);
    // Fallback to localStorage if Firebase fails
    const stored = localStorage.getItem('transferko-prices');
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultRoutes;
  }
};

// Save prices to Firebase
export const savePrices = async (prices: RoutePrice[]): Promise<boolean> => {
  try {
    const routesRef = ref(database, 'routes');
    await set(routesRef, prices);
    
    // Also save to localStorage as backup
    localStorage.setItem('transferko-prices', JSON.stringify(prices));
    
    return true;
  } catch (error) {
    console.error('Error saving prices to Firebase:', error);
    return false;
  }
};

// Reset prices to default values
export const resetPrices = async (): Promise<boolean> => {
  try {
    const routesRef = ref(database, 'routes');
    await set(routesRef, defaultRoutes);
    
    // Also reset localStorage
    localStorage.setItem('transferko-prices', JSON.stringify(defaultRoutes));
    
    return true;
  } catch (error) {
    console.error('Error resetting prices in Firebase:', error);
    return false;
  }
};

// Update a single route
export const updateRoute = async (routeId: string, updatedRoute: RoutePrice): Promise<boolean> => {
  try {
    const currentPrices = await getPrices();
    const updatedPrices = currentPrices.map(route => 
      route.id === routeId ? updatedRoute : route
    );
    
    return await savePrices(updatedPrices);
  } catch (error) {
    console.error('Error updating route in Firebase:', error);
    return false;
  }
};

// Delete a route
export const deleteRoute = async (routeId: string): Promise<boolean> => {
  try {
    const currentPrices = await getPrices();
    const filteredPrices = currentPrices.filter(route => route.id !== routeId);
    
    return await savePrices(filteredPrices);
  } catch (error) {
    console.error('Error deleting route from Firebase:', error);
    return false;
  }
};

// Add a new route
export const addRoute = async (newRoute: RoutePrice): Promise<boolean> => {
  try {
    const currentPrices = await getPrices();
    
    // Check if route with same ID already exists
    if (currentPrices.some(route => route.id === newRoute.id)) {
      throw new Error('Route with this ID already exists');
    }
    
    const updatedPrices = [...currentPrices, newRoute];
    return await savePrices(updatedPrices);
  } catch (error) {
    console.error('Error adding route to Firebase:', error);
    return false;
  }
};

// Get route name for specific language
export const getRouteName = (routeId: string, language: Language, routes: RoutePrice[]): string => {
  const route = routes.find(r => r.id === routeId);
  return route?.names[language] || routeId;
};

// Get WhatsApp message for specific language
export const getWhatsAppMessage = (routeId: string, language: Language, routes: RoutePrice[]): string => {
  const route = routes.find(r => r.id === routeId);
  return route?.whatsappMessages[language] || `Hello! I am interested in transfer ${routeId}.`;
};