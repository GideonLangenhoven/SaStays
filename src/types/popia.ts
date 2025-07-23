// POPIA (Protection of Personal Information Act) compliance types

export interface DataProcessingPurpose {
  id: string;
  purposeCode: string;
  purposeName: string;
  description: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  retentionPeriod: number; // in days
  isActive: boolean;
  createdAt: Date;
}

export interface ConsentRecord {
  id: string;
  customerId: string;
  purposeCode: string;
  consentGiven: boolean;
  consentMethod: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  consentSource: 'website' | 'mobile_app' | 'email' | 'phone' | 'in_person';
  consentTimestamp: Date;
  withdrawalTimestamp?: Date;
  withdrawalMethod?: string;
  ipAddress?: string;
  userAgent?: string;
  additionalData?: Record<string, any>;
  createdAt: Date;
}

export interface DataRetentionPolicy {
  id: string;
  dataCategory: string;
  retentionPeriod: number; // in days
  deletionMethod: 'automatic' | 'manual' | 'anonymize';
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  policyDescription: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataAccessRequest {
  id: string;
  customerId: string;
  requestType: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction';
  requestDate: Date;
  requestDetails?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  responseDate?: Date;
  responseDetails?: string;
  processedBy?: string;
  verificationMethod?: string;
  verificationDate?: Date;
  completionDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataBreachIncident {
  id: string;
  breachReference: string;
  detectionDate: Date;
  breachType: 'confidentiality' | 'integrity' | 'availability';
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedDataCategories: string[];
  affectedIndividualsCount: number;
  description: string;
  cause?: string;
  immediateActions?: string;
  containmentDate?: Date;
  riskAssessment?: string;
  notificationRequired: boolean;
  regulatorNotified: boolean;
  regulatorNotificationDate?: Date;
  individualsNotified: boolean;
  individualsNotificationDate?: Date;
  resolutionDate?: Date;
  lessonsLearned?: string;
  status: 'open' | 'contained' | 'resolved' | 'closed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrivacyAuditEntry {
  id: string;
  customerId: string;
  actionType: 'data_created' | 'data_accessed' | 'data_modified' | 'data_deleted' | 'consent_given' | 'consent_withdrawn';
  dataCategory?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  actionBy?: string;
  actionSource: 'system' | 'admin' | 'customer' | 'api';
  ipAddress?: string;
  userAgent?: string;
  purposeCode?: string;
  legalBasis?: string;
  additionalContext?: Record<string, any>;
  createdAt: Date;
}

export interface CustomerPrivacySettings {
  id: string;
  customerId: string;
  allowMarketingEmails: boolean;
  allowMarketingSMS: boolean;
  allowPromotionalCalls: boolean;
  allowAnalyticsTracking: boolean;
  allowPersonalization: boolean;
  allowThirdPartySharing: boolean;
  dataRetentionPreference: 'minimal' | 'standard' | 'extended';
  communicationFrequency: 'minimal' | 'normal' | 'frequent';
  preferredContactMethod: 'email' | 'sms' | 'phone' | 'post';
  privacyLevel: 'minimal' | 'standard' | 'enhanced';
  settingsLastUpdated: Date;
  createdAt: Date;
}

export interface POPIAComplianceStatus {
  activeCustomers: number;
  anonymizedCustomers: number;
  activeConsents: number;
  withdrawnConsents: number;
  pendingRequests: number;
  expiringSoon: number;
  activeBreaches: number;
}

export interface ConsentRequestForm {
  customerId: string;
  purposes: {
    purposeCode: string;
    consentGiven: boolean;
  }[];
  consentMethod: ConsentRecord['consentMethod'];
  consentSource: ConsentRecord['consentSource'];
  ipAddress?: string;
  userAgent?: string;
}

export interface DataExportRequest {
  customerId: string;
  includePersonalData: boolean;
  includeBookingHistory: boolean;
  includePaymentHistory: boolean;
  includeCommunications: boolean;
  includePreferences: boolean;
  format: 'json' | 'csv' | 'pdf';
  deliveryMethod: 'download' | 'email';
}

export interface DataExportResult {
  exportId: string;
  customerId: string;
  requestDate: Date;
  completionDate?: Date;
  downloadUrl?: string;
  expiryDate: Date;
  status: 'processing' | 'completed' | 'failed' | 'expired';
  fileSize?: number;
  format: string;
}

export interface ConsentWithdrawalRequest {
  customerId: string;
  purposeCodes: string[];
  withdrawalMethod: string;
  withdrawalReason?: string;
}

export interface PrivacyImpactAssessment {
  id: string;
  assessmentName: string;
  dataProcessingActivity: string;
  dataTypes: string[];
  purposes: string[];
  legalBasis: string[];
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  mitigationMeasures: string[];
  assessmentDate: Date;
  reviewDate: Date;
  assessedBy: string;
  status: 'draft' | 'under_review' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSubjectRights {
  right: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
  description: string;
  responseTimeLimit: number; // in days
  isAvailable: boolean;
  conditions?: string[];
}

export interface POPIASettings {
  id: string;
  organizationName: string;
  informationOfficer: {
    name: string;
    email: string;
    phone: string;
  };
  privacyPolicyVersion: string;
  privacyPolicyLastUpdated: Date;
  cookiePolicyVersion: string;
  dataRetentionDefaultPeriod: number; // in days
  autoAnonymizationEnabled: boolean;
  breachNotificationEnabled: boolean;
  regulatorNotificationThreshold: number; // number of affected individuals
  consentRenewalPeriod: number; // in days
  settings: {
    requireExplicitConsent: boolean;
    enableRightToBeForgotten: boolean;
    enableDataPortability: boolean;
    enableAutomaticDeletion: boolean;
    logAllDataAccess: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response interfaces for API
export interface CreateDataAccessRequestRequest {
  requestType: DataAccessRequest['requestType'];
  requestDetails?: string;
  verificationData: {
    email: string;
    phone?: string;
    identityNumber?: string;
  };
}

export interface ProcessDataAccessRequestRequest {
  status: 'processing' | 'completed' | 'rejected';
  responseDetails?: string;
  rejectionReason?: string;
}

export interface CreateDataBreachRequest {
  detectionDate: Date;
  breachType: DataBreachIncident['breachType'];
  severityLevel: DataBreachIncident['severityLevel'];
  affectedDataCategories: string[];
  affectedIndividualsCount: number;
  description: string;
  cause?: string;
  immediateActions?: string;
}

export interface UpdatePrivacySettingsRequest {
  allowMarketingEmails?: boolean;
  allowMarketingSMS?: boolean;
  allowPromotionalCalls?: boolean;
  allowAnalyticsTracking?: boolean;
  allowPersonalization?: boolean;
  allowThirdPartySharing?: boolean;
  dataRetentionPreference?: CustomerPrivacySettings['dataRetentionPreference'];
  communicationFrequency?: CustomerPrivacySettings['communicationFrequency'];
  preferredContactMethod?: CustomerPrivacySettings['preferredContactMethod'];
  privacyLevel?: CustomerPrivacySettings['privacyLevel'];
}

// Utility types
export type DataCategory = 
  | 'personal_information'
  | 'contact_details'
  | 'booking_history'
  | 'payment_information'
  | 'communication_logs'
  | 'behavioral_data'
  | 'technical_data'
  | 'marketing_data';

export type ConsentStatus = 'given' | 'withdrawn' | 'expired' | 'pending';

export type DataProcessingLawfulness = 
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';

// Form validation schemas
export interface ConsentFormData {
  marketingEmails: boolean;
  marketingSMS: boolean;
  analyticsTracking: boolean;
  personalizedContent: boolean;
  thirdPartySharing: boolean;
  acknowledgment: boolean;
}

export interface PrivacyPreferencesFormData {
  dataRetentionPreference: CustomerPrivacySettings['dataRetentionPreference'];
  communicationFrequency: CustomerPrivacySettings['communicationFrequency'];
  preferredContactMethod: CustomerPrivacySettings['preferredContactMethod'];
  privacyLevel: CustomerPrivacySettings['privacyLevel'];
}