export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  ACADEMIC = 'ACADEMIC'
}

export enum CatStatus {
  ALIVE = 'ALIVE', // Yaşıyor
  ADOPTED = 'ADOPTED', // Sahiplenildi
  DECEASED = 'DECEASED' // Melek Oldu
}

export enum CampusZone {
  LIBRARY = 'Kütüphane Önü',
  DINING_HALL = 'Yemekhane',
  HANGAR = 'Hangar Bölgesi',
  RECTORATE = 'Rektörlük',
  PARKING = 'Otopark',
  DORMITORY = 'Yurtlar',
  UNKNOWN = 'Bilinmiyor'
}

export interface User {
  id: string;
  email: string; // This is the personal/login email
  role: UserRole;
  name: string; // Full Name

  // Extended Profile
  schoolEmail?: string;
  department?: string;
  studentId?: string; // Student only
  grade?: string; // Student only: Hazırlık, 1. Sınıf...

  emailVerified?: boolean;
}

export interface FeedingLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: number;
  amountGrams: number;
}

export interface Cat {
  id: string;
  name: string;
  imageUrl: string;
  status: CatStatus;
  zone: CampusZone;
  description: string;
  color: string;
  features: string; // Belirgin özellikler
  isApproved: boolean; // Admin onayı
  votes: Record<string, number>; // Name suggestions and vote counts
  votedUserIds: string[]; // IDs of users who have voted
  feedingLogs: FeedingLog[];
  createdAt: number;
}

export interface MapMarker {
  id: string;
  type: 'CAT' | 'FOOD';
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  relatedId?: string; // If CAT, id of cat
  status?: 'FULL' | 'EMPTY'; // For food
  timestamp: number;
  description?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: number;
  imageUrl?: string;
}