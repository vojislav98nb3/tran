// Legacy file - keeping for backward compatibility
// All functionality has been moved to firebaseStorage.ts

export interface RoutePrice {
  id: string;
  price: string;
  icon: string;
  priceDescription?: string;
}

// Re-export from Firebase storage for backward compatibility
export { 
  getPrices, 
  savePrices, 
  resetPrices, 
  updateRoute, 
  deleteRoute, 
  addRoute 
} from './firebaseStorage';