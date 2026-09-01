// ─── Enums (miroir du backend) ────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  OWNER = 'OWNER',
  CONCIERGE = 'CONCIERGE',
  ADMIN = 'ADMIN',
}

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

export enum ResourceType {
  PROPERTY = 'PROPERTY',
  CAR = 'CAR',
}

export enum PaymentMethod {
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MOMO = 'MTN_MOMO',
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  CASH = 'CASH',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  UNAVAILABLE = 'UNAVAILABLE',
  SUSPENDED = 'SUSPENDED',
}

export enum CarCategory {
  ECONOMY = 'ECONOMY',
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  LUXURY = 'LUXURY',
  VAN = 'VAN',
  ELECTRIC = 'ELECTRIC',
  PICKUP = 'PICKUP',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ISSUE_REPORTED = 'ISSUE_REPORTED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  language: 'fr' | 'en';
  isActive: boolean;
  isEmailVerified: boolean;
  referralCode?: string;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  walletBalance: number;
  createdAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: Partial<User>;
}

export interface Property {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  type: string;
  address: string;
  city: string;
  neighborhood?: string;
  country: string;
  lat: number;
  lng: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  cleaningFee: number;
  securityDeposit: number;
  currency: string;
  checkinTime: string;
  checkoutTime: string;
  minStayNights: number;
  maxStayNights?: number;
  instantBooking: boolean;
  kycRequired: boolean;
  status: PropertyStatus;
  avgRating: number;
  reviewCount: number;
  cancellationPolicy: string;
  rules?: Record<string, any>;
  isFeatured: boolean;
  images: PropertyImage[];
  amenities: Amenity[];
  owner?: Partial<User>;
  createdAt: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  cloudinaryId: string;
  caption?: string;
  isCover: boolean;
  sortOrder: number;
}

export interface Amenity {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  category: string;
}

export interface Car {
  id: string;
  ownerId: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  transmission: 'MANUAL' | 'AUTOMATIC';
  fuelType: string;
  seats: number;
  doors: number;
  color: string;
  plateNumber?: string;
  mileageKm: number;
  description: string;
  descriptionEn?: string;
  pricePerDay: number;
  currency: string;
  depositRequired: boolean;
  depositAmount: number;
  kycRequired: boolean;
  licenseRequired: boolean;
  trackingEnabled: boolean;
  minDriverAge: number;
  city: string;
  lat: number;
  lng: number;
  status: string;
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  lastKnownLat?: number;
  lastKnownLng?: number;
  lastLocationAt?: string;
  images: CarImage[];
  owner?: Partial<User>;
}

export interface CarImage {
  id: string;
  carId: string;
  url: string;
  cloudinaryId: string;
  isCover: boolean;
  sortOrder: number;
}

export interface Booking {
  id: string;
  bundleId?: string;
  customerId: string;
  resourceType: ResourceType;
  propertyId?: string;
  carId?: string;
  conciergeId?: string;
  startDate: string;
  endDate: string;
  guestsCount: number;
  status: BookingStatus;
  basePrice: number;
  cleaningFee: number;
  platformFee: number;
  discountAmount: number;
  couponCode?: string;
  loyaltyPointsUsed: number;
  walletUsed: number;
  totalAmount: number;
  currency: string;
  depositAmount: number;
  depositStatus: string;
  depositCollectedAt?: string;
  checkinAt?: string;
  checkoutAt?: string;
  specialRequests?: string;
  extensionCount: number;
  cancellationReason?: string;
  createdAt: string;
  // Relations peuplées
  property?: Property;
  car?: Car;
  customer?: Partial<User>;
}

export interface BookingExtension {
  id: string;
  bookingId: string;
  previousEndDate: string;
  newEndDate: string;
  extraNightsDays: number;
  extraAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amountExpected: number;
  amountReceived: number;
  currency: string;
  reference?: string;
  confirmedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  resourceType: ResourceType;
  propertyId?: string;
  carId?: string;
  rating: number;
  cleanliness?: number;
  communication?: number;
  location?: number;
  value?: number;
  vehicleCondition?: number;
  comment: string;
  ownerReply?: string;
  ownerRepliedAt?: string;
  isVisible: boolean;
  createdAt: string;
  reviewer?: Partial<User>;
}

export interface Task {
  id: string;
  bookingId?: string;
  assignedTo: string;
  createdBy: string;
  type: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt?: string;
  startedAt?: string;
  completedAt?: string;
  photos?: string[];
  notes?: string;
  issueReported: boolean;
  issueDescription?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  readAt?: string;
  createdAt: string;
}

export interface PlatformSettings {
  kyc_required: boolean;
  license_required: boolean;
  deposit_required: boolean;
  default_currency: string;
  platform_name: string;
  payment_methods: Record<string, PaymentMethodConfig>;
}

export interface PaymentMethodConfig {
  enabled: boolean;
  label: string;
  merchant_code?: string;
  instructions_fr?: string;
  instructions_en?: string;
}

// ─── Réponse API paginée ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  city?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
  sort?: string;
  page?: number;
}

export interface CarSearchFilters {
  city?: string;
  pickup?: string;
  returnDate?: string;
  category?: CarCategory;
  transmission?: string;
  maxPrice?: number;
  seats?: number;
  page?: number;
}

export interface PriceEstimate {
  basePrice: number;
  nights: number;
  cleaningFee: number;
  platformFee: number;
  discountAmount: number;
  depositAmount: number;
  total: number;
}
