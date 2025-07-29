import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID Generation Functions

/**
 * Generate a user-friendly user ID based on the user's name
 */
export function generateUserId(name: string): string {
  // Clean and format the name
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .trim();

  // Try different variations
  const variations = [
    cleanName,
    cleanName.split(' ')[0], // First name only
    cleanName.substring(0, 15), // First 15 characters
    cleanName + '1',
    cleanName + '2',
    cleanName + '3'
  ];

  // For now, return the first variation with timestamp to ensure uniqueness
  // In production, you'd check against database for existing IDs
  const baseId = variations[0] || 'user';
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  
  return `${baseId}${timestamp}`;
}

/**
 * Generate a category ID based on category name
 */
export function generateCategoryId(categoryName: string): string {
  const cleanName = categoryName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .trim();

  return cleanName || 'category';
}

/**
 * Generate a product ID with a more systematic approach
 */
export function generateProductId(productName?: string): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  if (productName) {
    const cleanName = productName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 8);
    return `prod-${cleanName}-${timestamp.slice(-8)}${random}`;
  }
  
  return `prod-${timestamp.slice(-8)}${random}`;
}

/**
 * Generate an order ID with date and sequence
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const time = now.getTime().toString().slice(-6);
  
  return `ORD-${year}${month}${day}-${time}`;
}

/**
 * Generate a withdrawal request ID
 */
export function generateWithdrawalRequestId(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `WR-${timestamp.slice(-8)}-${random}`;
}

/**
 * Calculate delivery charge based on distance and settings
 */
export interface DeliveryChargeSettings {
  baseCharge: number;
  perKmCharge: number;
  freeDeliveryThreshold?: number;
}

export function calculateDeliveryCharge(
  distance: number,
  orderTotal: number,
  settings: DeliveryChargeSettings
): number {
  // Free delivery if order meets threshold
  if (settings.freeDeliveryThreshold && orderTotal >= settings.freeDeliveryThreshold) {
    return 0;
  }
  
  return settings.baseCharge + (distance * settings.perKmCharge);
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currencySymbol: string = '৳'): string {
  return `${currencySymbol}${amount.toFixed(2)}`;
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Bangladesh format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Bangladesh phone number format: 01XXXXXXXXX (11 digits starting with 01)
  const phoneRegex = /^01[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Generate a secure random string
 */
export function generateRandomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if a string is a valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Calculate delivery charge based on location and weight
 */
export function calculateLocationBasedDeliveryCharge(
  buyerAddress: any,
  sellerAddress: any,
  deliverySettings: any,
  productWeightKg: number = 1
): number {
  // Normalize address fields for comparison
  const normalizeField = (field: any) => {
    return (field || '').toString().trim().toLowerCase();
  };

  const buyerUpazilla = normalizeField(buyerAddress?.upazilla);
  const sellerUpazilla = normalizeField(sellerAddress?.upazilla);
  const buyerDistrict = normalizeField(buyerAddress?.district);
  const sellerDistrict = normalizeField(sellerAddress?.district);

  let baseCharge = 0;
  let extraKgCharge = 0;

  // Determine base charge and extra KG charge based on location
  if (!sellerAddress) {
    // No seller address - use highest charge (inter-district)
    baseCharge = deliverySettings.inter_district_charge || deliverySettings.interDistrict || 130;
    extraKgCharge = deliverySettings.inter_district_extra_kg_charge || deliverySettings.interDistrictExtraKg || 40;
  } else if (buyerUpazilla && sellerUpazilla && buyerUpazilla === sellerUpazilla && buyerDistrict === sellerDistrict) {
    // Same upazilla and district - intra upazilla (using upazilla instead of thana)
    baseCharge = deliverySettings.intra_upazilla_charge || deliverySettings.intra_thana_charge || deliverySettings.intraUpazilla || deliverySettings.intraThana || 60;
    extraKgCharge = deliverySettings.intra_upazilla_extra_kg_charge || deliverySettings.intra_thana_extra_kg_charge || deliverySettings.intraUpazillaExtraKg || deliverySettings.intraThanaExtraKg || 20;
  } else if (buyerDistrict && sellerDistrict && buyerDistrict === sellerDistrict) {
    // Same district, different upazilla - intra district
    baseCharge = deliverySettings.intra_district_charge || deliverySettings.intraDistrict || 110;
    extraKgCharge = deliverySettings.intra_district_extra_kg_charge || deliverySettings.intraDistrictExtraKg || 30;
  } else {
    // Different districts - inter district
    baseCharge = deliverySettings.inter_district_charge || deliverySettings.interDistrict || 130;
    extraKgCharge = deliverySettings.inter_district_extra_kg_charge || deliverySettings.interDistrictExtraKg || 40;
  }

  // Calculate weight-based charges using ceiling logic
  const finalWeight = Math.max(productWeightKg, 0); // Ensure positive weight
  let totalCharge = baseCharge;

  // Add extra charges for weight above 1KG using ceiling logic
  if (finalWeight > 1) {
    // Use ceiling: 1.1KG = 2KG charge, 2.4KG = 3KG charge
    const ceilingWeight = Math.ceil(finalWeight);
    const extraKgUnits = ceilingWeight - 1; // Subtract the base 1KG
    totalCharge += extraKgUnits * extraKgCharge;
  }

  return Math.round(totalCharge * 100) / 100; // Round to 2 decimal places
}
