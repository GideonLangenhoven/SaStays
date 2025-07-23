import { apiClient } from './api';
import {
  DataProcessingPurpose,
  ConsentRecord,
  DataRetentionPolicy,
  DataAccessRequest,
  DataBreachIncident,
  PrivacyAuditEntry,
  CustomerPrivacySettings,
  POPIAComplianceStatus,
  ConsentRequestForm,
  DataExportRequest,
  DataExportResult,
  ConsentWithdrawalRequest,
  CreateDataAccessRequestRequest,
  ProcessDataAccessRequestRequest,
  CreateDataBreachRequest,
  UpdatePrivacySettingsRequest,
  POPIASettings,
  ConsentFormData,
  PrivacyPreferencesFormData
} from '@/types/popia';

class POPIAService {
  // Consent Management
  async recordConsent(request: ConsentRequestForm): Promise<ConsentRecord[]> {
    const response = await apiClient.post('/api/popia/consent', request);
    return response.data;
  }

  async withdrawConsent(request: ConsentWithdrawalRequest): Promise<{ success: boolean; withdrawnCount: number }> {
    const response = await apiClient.post('/api/popia/consent/withdraw', request);
    return response.data;
  }

  async getCustomerConsents(customerId: string): Promise<ConsentRecord[]> {
    const response = await apiClient.get(`/api/popia/consent/${customerId}`);
    return response.data;
  }

  async getConsentHistory(customerId: string, purposeCode?: string): Promise<ConsentRecord[]> {
    const params = purposeCode ? `?purposeCode=${purposeCode}` : '';
    const response = await apiClient.get(`/api/popia/consent/${customerId}/history${params}`);
    return response.data;
  }

  async renewConsent(customerId: string, purposeCodes: string[]): Promise<ConsentRecord[]> {
    const response = await apiClient.post(`/api/popia/consent/${customerId}/renew`, { purposeCodes });
    return response.data;
  }

  // Data Subject Rights
  async createDataAccessRequest(request: CreateDataAccessRequestRequest): Promise<DataAccessRequest> {
    const response = await apiClient.post('/api/popia/data-requests', request);
    return response.data;
  }

  async getDataAccessRequests(
    page = 1,
    limit = 20,
    status?: DataAccessRequest['status']
  ): Promise<{
    requests: DataAccessRequest[];
    total: number;
    pending: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await apiClient.get(`/api/popia/data-requests?${params}`);
    return response.data;
  }

  async processDataAccessRequest(
    requestId: string,
    update: ProcessDataAccessRequestRequest
  ): Promise<DataAccessRequest> {
    const response = await apiClient.put(`/api/popia/data-requests/${requestId}`, update);
    return response.data;
  }

  async verifyDataAccessRequest(requestId: string, verificationCode: string): Promise<{ verified: boolean }> {
    const response = await apiClient.post(`/api/popia/data-requests/${requestId}/verify`, { verificationCode });
    return response.data;
  }

  // Data Export and Portability
  async requestDataExport(request: DataExportRequest): Promise<{ exportId: string; estimatedCompletionTime: number }> {
    const response = await apiClient.post('/api/popia/data-export', request);
    return response.data;
  }

  async getDataExportStatus(exportId: string): Promise<DataExportResult> {
    const response = await apiClient.get(`/api/popia/data-export/${exportId}/status`);
    return response.data;
  }

  async downloadDataExport(exportId: string): Promise<Blob> {
    const response = await apiClient.get(`/api/popia/data-export/${exportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async getCustomerDataExports(customerId: string): Promise<DataExportResult[]> {
    const response = await apiClient.get(`/api/popia/data-export/customer/${customerId}`);
    return response.data;
  }

  // Privacy Settings Management
  async getPrivacySettings(customerId: string): Promise<CustomerPrivacySettings> {
    const response = await apiClient.get(`/api/popia/privacy-settings/${customerId}`);
    return response.data;
  }

  async updatePrivacySettings(
    customerId: string,
    settings: UpdatePrivacySettingsRequest
  ): Promise<CustomerPrivacySettings> {
    const response = await apiClient.put(`/api/popia/privacy-settings/${customerId}`, settings);
    return response.data;
  }

  async resetPrivacySettings(customerId: string): Promise<CustomerPrivacySettings> {
    const response = await apiClient.post(`/api/popia/privacy-settings/${customerId}/reset`);
    return response.data;
  }

  // Data Retention Management
  async getRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    const response = await apiClient.get('/api/popia/retention-policies');
    return response.data;
  }

  async updateRetentionPolicy(
    policyId: string,
    policy: Partial<DataRetentionPolicy>
  ): Promise<DataRetentionPolicy> {
    const response = await apiClient.put(`/api/popia/retention-policies/${policyId}`, policy);
    return response.data;
  }

  async getCustomersForDeletion(): Promise<{
    expiredCustomers: Array<{
      customerId: string;
      email: string;
      fullName: string;
      expiryDate: Date;
      daysPastExpiry: number;
    }>;
    expiringSoon: Array<{
      customerId: string;
      email: string;
      fullName: string;
      expiryDate: Date;
      daysUntilExpiry: number;
    }>;
  }> {
    const response = await apiClient.get('/api/popia/retention/expiring');
    return response.data;
  }

  async executeDataDeletion(customerIds: string[], method: 'anonymize' | 'delete'): Promise<{
    processed: number;
    failed: number;
    details: Array<{ customerId: string; status: 'success' | 'failed'; error?: string }>;
  }> {
    const response = await apiClient.post('/api/popia/retention/execute-deletion', {
      customerIds,
      method
    });
    return response.data;
  }

  // Audit Trail and Compliance
  async getAuditTrail(
    customerId?: string,
    actionType?: PrivacyAuditEntry['actionType'],
    dateFrom?: Date,
    dateTo?: Date,
    page = 1,
    limit = 50
  ): Promise<{
    entries: PrivacyAuditEntry[];
    total: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (customerId) params.append('customerId', customerId);
    if (actionType) params.append('actionType', actionType);
    if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
    if (dateTo) params.append('dateTo', dateTo.toISOString());

    const response = await apiClient.get(`/api/popia/audit-trail?${params}`);
    return response.data;
  }

  async logDataAccess(
    customerId: string,
    dataCategory: string,
    purposeCode: string,
    accessedFields?: string[]
  ): Promise<void> {
    await apiClient.post('/api/popia/audit-trail/log-access', {
      customerId,
      dataCategory,
      purposeCode,
      accessedFields
    });
  }

  // Data Breach Management
  async reportDataBreach(breach: CreateDataBreachRequest): Promise<DataBreachIncident> {
    const response = await apiClient.post('/api/popia/data-breaches', breach);
    return response.data;
  }

  async getDataBreaches(
    status?: DataBreachIncident['status'],
    severity?: DataBreachIncident['severityLevel']
  ): Promise<DataBreachIncident[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);

    const response = await apiClient.get(`/api/popia/data-breaches?${params}`);
    return response.data;
  }

  async updateDataBreach(
    breachId: string,
    update: Partial<DataBreachIncident>
  ): Promise<DataBreachIncident> {
    const response = await apiClient.put(`/api/popia/data-breaches/${breachId}`, update);
    return response.data;
  }

  async notifyRegulatorOfBreach(breachId: string): Promise<{ notificationSent: boolean; reference: string }> {
    const response = await apiClient.post(`/api/popia/data-breaches/${breachId}/notify-regulator`);
    return response.data;
  }

  async notifyIndividualsOfBreach(breachId: string): Promise<{ notificationsSent: number; failed: number }> {
    const response = await apiClient.post(`/api/popia/data-breaches/${breachId}/notify-individuals`);
    return response.data;
  }

  // Compliance Dashboard
  async getComplianceStatus(): Promise<POPIAComplianceStatus> {
    const response = await apiClient.get('/api/popia/compliance/status');
    return response.data;
  }

  async getComplianceReport(
    period: 'month' | 'quarter' | 'year',
    format: 'json' | 'pdf' | 'csv' = 'json'
  ): Promise<any> {
    const response = await apiClient.get(`/api/popia/compliance/report?period=${period}&format=${format}`, {
      responseType: format === 'json' ? 'json' : 'blob'
    });
    return response.data;
  }

  // POPIA Settings Management
  async getPOPIASettings(): Promise<POPIASettings> {
    const response = await apiClient.get('/api/popia/settings');
    return response.data;
  }

  async updatePOPIASettings(settings: Partial<POPIASettings>): Promise<POPIASettings> {
    const response = await apiClient.put('/api/popia/settings', settings);
    return response.data;
  }

  // Data Processing Purposes
  async getProcessingPurposes(): Promise<DataProcessingPurpose[]> {
    const response = await apiClient.get('/api/popia/processing-purposes');
    return response.data;
  }

  async createProcessingPurpose(purpose: Omit<DataProcessingPurpose, 'id' | 'createdAt'>): Promise<DataProcessingPurpose> {
    const response = await apiClient.post('/api/popia/processing-purposes', purpose);
    return response.data;
  }

  async updateProcessingPurpose(
    purposeId: string,
    purpose: Partial<DataProcessingPurpose>
  ): Promise<DataProcessingPurpose> {
    const response = await apiClient.put(`/api/popia/processing-purposes/${purposeId}`, purpose);
    return response.data;
  }

  // Customer Data Management
  async getCustomerDataSummary(customerId: string): Promise<{
    personalData: Record<string, any>;
    consentStatus: Record<string, boolean>;
    dataCategories: string[];
    lastActivity: Date;
    retentionExpiry: Date;
    exportHistory: DataExportResult[];
    accessRequestHistory: DataAccessRequest[];
  }> {
    const response = await apiClient.get(`/api/popia/customer-data/${customerId}/summary`);
    return response.data;
  }

  async anonymizeCustomer(customerId: string, reason: string): Promise<{ anonymized: boolean; anonymizationId: string }> {
    const response = await apiClient.post(`/api/popia/customer-data/${customerId}/anonymize`, { reason });
    return response.data;
  }

  async deleteCustomerData(customerId: string, reason: string): Promise<{ deleted: boolean; deletionId: string }> {
    const response = await apiClient.delete(`/api/popia/customer-data/${customerId}`, { data: { reason } });
    return response.data;
  }

  // Utility methods for forms and validation
  async validateConsentForm(formData: ConsentFormData): Promise<{ valid: boolean; errors: string[] }> {
    // Client-side validation
    const errors: string[] = [];

    if (!formData.acknowledgment) {
      errors.push('You must acknowledge the privacy policy to proceed');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async validatePrivacyPreferences(formData: PrivacyPreferencesFormData): Promise<{ valid: boolean; errors: string[] }> {
    // Client-side validation
    const errors: string[] = [];

    if (!formData.dataRetentionPreference) {
      errors.push('Data retention preference is required');
    }

    if (!formData.communicationFrequency) {
      errors.push('Communication frequency preference is required');
    }

    if (!formData.preferredContactMethod) {
      errors.push('Preferred contact method is required');
    }

    if (!formData.privacyLevel) {
      errors.push('Privacy level preference is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper method to check if customer has given consent for a specific purpose
  async hasValidConsent(customerId: string, purposeCode: string): Promise<boolean> {
    try {
      const consents = await this.getCustomerConsents(customerId);
      const relevantConsent = consents.find(c => 
        c.purposeCode === purposeCode && 
        c.consentGiven && 
        !c.withdrawalTimestamp
      );
      return !!relevantConsent;
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }

  // Helper method to get data retention expiry date
  async getDataRetentionExpiry(customerId: string): Promise<Date | null> {
    try {
      const summary = await this.getCustomerDataSummary(customerId);
      return summary.retentionExpiry;
    } catch (error) {
      console.error('Error getting retention expiry:', error);
      return null;
    }
  }

  // Helper method to check if customer data should be anonymized
  async shouldAnonymizeCustomer(customerId: string): Promise<boolean> {
    try {
      const expiryDate = await this.getDataRetentionExpiry(customerId);
      if (!expiryDate) return false;
      
      return new Date() > new Date(expiryDate);
    } catch (error) {
      console.error('Error checking anonymization requirement:', error);
      return false;
    }
  }
}

export const popiaService = new POPIAService();
export default popiaService;