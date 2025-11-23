// Fix: Import React to make React types available.
import React from 'react';

export enum View {
  DASHBOARD = 'DASHBOARD',
  CLASSIFIER = 'CLASSIFIER',
  LOCATOR = 'LOCATOR',
  QUIZ = 'QUIZ',
  REPORT = 'REPORT',
  CHATBOT = 'CHATBOT',
  PROFILE = 'PROFILE',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  TRANSPARENCY_DASHBOARD = 'TRANSPARENCY_DASHBOARD',
  TRAINING = 'TRAINING',
  COMMUNITY = 'COMMUNITY',
  BUILDING_STATUS = 'BUILDING_STATUS',
  MARKETPLACE = 'MARKETPLACE',
  B2B_PORTAL = 'B2B_PORTAL',
}

export interface WasteClassificationResult {
  wasteType: 'Wet Waste' | 'Dry Waste' | 'Hazardous' | 'Recyclable' | 'Unknown';
  itemName: string;
  description: string;
  disposalInstructions: string;
  recyclable: boolean;
}

// Added: New type for high-value recyclable identification.
export interface HighValueRecyclableResult extends WasteClassificationResult {
  materialType: 'PET' | 'HDPE' | 'Aluminum' | 'Copper' | 'Other' | 'Unknown';
  estimatedValue: string; // e.g., "₹5-10 per kg"
  valueDescription: string;
  handlingInstructions: string;
}

export interface WasteMediaAuthenticationResult {
  isValidWasteReport: boolean;
  isRecent: boolean;
  reason: string;
}

// Added: New type for advanced AI analysis of reported waste.
export interface ReportAnalysis {
  estimatedVolume: 'Small' | 'Medium' | 'Large' | 'Unknown';
  wasteTypeCategory: 'Household' | 'Construction Debris' | 'E-waste' | 'Mixed Commercial' | 'Organic' | 'Unknown';
  isBulkGenerator: boolean;
  analysisSummary: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizAnalysis {
  performanceSummary: string;
  improvementAreas: string[];
  nextSteps: string;
}

// Added: New type for segregation game analysis.
export interface SegregationAnalysis {
    performanceSummary: string;
    improvementTips: {
        item: string;
        tip: string;
    }[];
    suggestedVideos: string[];
}

export type BadgeSlug = 'first-scan' | 'quiz-master' | 'eco-reporter' | 'chat-champ' | 'novice-recycler' | 'community-helper' | 'scrap-seller' | 'corporate-citizen';

export interface Badge {
  slug: BadgeSlug;
  name: string;
  description: string;
  // Fix: Changed icon type to be more specific, allowing it to be cloned with a className prop.
  icon: React.ReactElement<{ className?: string }>;
  points: number;
}

export interface ClassificationHistoryItem {
  id: string;
  type: 'classification';
  timestamp: Date;
  data: WasteClassificationResult;
}

export type ReportStatus = 'Pending' | 'In Progress' | 'Resolved';

// Added: New type for penalty status.
export type PenaltyStatus = 'None' | 'Drafted' | 'Issued';

export interface ReportHistoryItem {
  id: string;
  type: 'report';
  timestamp: Date;
  data: {
    image: string;
    description: string;
    location?: { latitude: number; longitude: number };
    status: ReportStatus;
    buildingId?: string;
    // Added: Optional fields for advanced AI analysis and penalty tracking.
    analysis?: ReportAnalysis;
    penaltyStatus: PenaltyStatus;
  };
}

export type HistoryItem = ClassificationHistoryItem | ReportHistoryItem;

export interface Facility {
  name: string;
  address: string;
}

export interface Community {
    id: string;
    name: string;
    description: string;
    creatorId: string;
    creatorName: string;
    timestamp: string;
}

export interface CommunityMember {
    userId: string;
    userName: string;
}

export interface CommunityMessage {
    id: string;
    communityId: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
}

export interface ChatModerationResult {
    isAppropriate: boolean;
    reason?: string;
}

export type PenaltyType = 'Fine' | 'CollectionSuspended';

export interface Warning {
    id: string;
    timestamp: string;
    reason: string;
}

export interface Penalty {
    id: string;
    timestamp: string;
    type: PenaltyType;
    details: string; // e.g., "Fine of ₹5000" or "Collection suspended for 3 days"
    isResolved: boolean;
}

export type BuildingStatus = 'Compliant' | 'UnderReview' | 'WarningIssued' | 'PenaltyActive';

export interface Building {
    id: string;
    name: string;
    address: string;
    status: BuildingStatus;
    warnings: Warning[];
    penalties: Penalty[];
}

export type PickupStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface PickupRequest {
    id: string;
    userId: string;
    materialType: string;
    estimatedWeight: string;
    address: string;
    contactNumber: string;
    photo?: string;
    status: PickupStatus;
    timestamp: string;
}

// B2B Portal Types
export type BulkWasteType = 'E-waste' | 'Plastics' | 'Organic' | 'Mixed Commercial' | 'Construction Debris';
export type BulkPickupStatus = 'Requested' | 'Scheduled' | 'Completed';

export interface BulkPickupRequest {
    id: string;
    businessId: string; // Using userId for this
    wasteType: BulkWasteType;
    estimatedWeightKg: number;
    preferredDate: string;
    status: BulkPickupStatus;
    timestamp: string;
    notes?: string;
}

export interface ComplianceReport {
    id: string;
    businessId: string;
    period: string; // e.g., "Q2 2024"
    generationDate: string;
    summaryData: {
        totalPickups: number;
        totalWeightKg: number;
        wasteBreakdown: Partial<Record<BulkWasteType, number>>;
    };
}

// Admin Vehicle Tracking Types
export enum VehicleStatus {
  IDLE = 'Idle',
  EN_ROUTE = 'En Route',
  COLLECTING = 'Collecting',
}

export interface Vehicle {
    id: string;
    currentLocation: {
        latitude: number;
        longitude: number;
    };
    status: VehicleStatus;
    assignedReportId?: string;
    destination?: {
        latitude: number;
        longitude: number;
    };
}

// Waste Worker Equipment Request Types
export type EquipmentRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface EquipmentRequest {
    id: string;
    workerId: string;
    items: string[];
    authorityName: string;
    status: EquipmentRequestStatus;
    timestamp: string;
}