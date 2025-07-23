import { apiClient } from './api';
import {
  AnalyticsDashboardData,
  AnalyticsMetrics,
  MonthlyTrendData,
  PropertyPerformance,
  GuestSatisfactionData,
  MarketInsights,
  RevenueOptimization,
  GuestAnalytics,
  AnalyticsFilters,
  AnalyticsApiResponse,
  AnalyticsExportRequest,
  AnalyticsReport,
  RealTimeMetrics,
  PredictiveAnalytics,
  PerformanceBenchmarks
} from '@/types/analytics';

class AnalyticsService {
  private wsConnection: WebSocket | null = null;
  private callbacks: Map<string, Function[]> = new Map();

  // Core Analytics Data Retrieval
  async getDashboardData(
    ownerId: string, 
    filters?: AnalyticsFilters
  ): Promise<AnalyticsDashboardData> {
    const params = new URLSearchParams({ ownerId });
    
    if (filters) {
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.from.toISOString());
        params.append('endDate', filters.dateRange.to.toISOString());
      }
      if (filters.propertyIds) {
        params.append('propertyIds', filters.propertyIds.join(','));
      }
      if (filters.guestSegment) {
        params.append('guestSegment', filters.guestSegment);
      }
      if (filters.bookingSource) {
        params.append('bookingSource', filters.bookingSource);
      }
    }

    const response = await apiClient.get<AnalyticsApiResponse<AnalyticsDashboardData>>(
      `/api/analytics/dashboard?${params}`
    );
    return response.data.data;
  }

  async getMetrics(ownerId: string, period: string = 'month'): Promise<AnalyticsMetrics> {
    const response = await apiClient.get<AnalyticsApiResponse<AnalyticsMetrics>>(
      `/api/analytics/metrics?ownerId=${ownerId}&period=${period}`
    );
    return response.data.data;
  }

  async getMonthlyTrends(
    ownerId: string, 
    months: number = 12
  ): Promise<MonthlyTrendData[]> {
    const response = await apiClient.get<AnalyticsApiResponse<MonthlyTrendData[]>>(
      `/api/analytics/trends/monthly?ownerId=${ownerId}&months=${months}`
    );
    return response.data.data;
  }

  async getPropertyPerformance(
    ownerId: string,
    propertyIds?: string[]
  ): Promise<PropertyPerformance[]> {
    const params = new URLSearchParams({ ownerId });
    if (propertyIds) {
      params.append('propertyIds', propertyIds.join(','));
    }

    const response = await apiClient.get<AnalyticsApiResponse<PropertyPerformance[]>>(
      `/api/analytics/properties/performance?${params}`
    );
    return response.data.data;
  }

  async getGuestSatisfaction(ownerId: string): Promise<GuestSatisfactionData> {
    const response = await apiClient.get<AnalyticsApiResponse<GuestSatisfactionData>>(
      `/api/analytics/guest-satisfaction?ownerId=${ownerId}`
    );
    return response.data.data;
  }

  async getMarketInsights(
    ownerId: string,
    location?: string
  ): Promise<MarketInsights> {
    const params = new URLSearchParams({ ownerId });
    if (location) {
      params.append('location', location);
    }

    const response = await apiClient.get<AnalyticsApiResponse<MarketInsights>>(
      `/api/analytics/market-insights?${params}`
    );
    return response.data.data;
  }

  async getRevenueOptimization(ownerId: string): Promise<RevenueOptimization> {
    const response = await apiClient.get<AnalyticsApiResponse<RevenueOptimization>>(
      `/api/analytics/revenue-optimization?ownerId=${ownerId}`
    );
    return response.data.data;
  }

  async getGuestAnalytics(ownerId: string): Promise<GuestAnalytics> {
    const response = await apiClient.get<AnalyticsApiResponse<GuestAnalytics>>(
      `/api/analytics/guest-analytics?ownerId=${ownerId}`
    );
    return response.data.data;
  }

  // Real-time Analytics
  async getRealTimeMetrics(ownerId: string): Promise<RealTimeMetrics> {
    const response = await apiClient.get<AnalyticsApiResponse<RealTimeMetrics>>(
      `/api/analytics/real-time?ownerId=${ownerId}`
    );
    return response.data.data;
  }

  // Predictive Analytics
  async getPredictiveAnalytics(ownerId: string): Promise<PredictiveAnalytics> {
    const response = await apiClient.get<AnalyticsApiResponse<PredictiveAnalytics>>(
      `/api/analytics/predictive?ownerId=${ownerId}`
    );
    return response.data.data;
  }

  // Performance Benchmarks
  async getPerformanceBenchmarks(
    location?: string,
    propertyType?: string
  ): Promise<PerformanceBenchmarks> {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (propertyType) params.append('propertyType', propertyType);

    const response = await apiClient.get<AnalyticsApiResponse<PerformanceBenchmarks>>(
      `/api/analytics/benchmarks?${params}`
    );
    return response.data.data;
  }

  // Revenue Analysis
  async getRevenueBreakdown(
    ownerId: string,
    period: string = 'month'
  ): Promise<{ category: string; amount: number; percentage: number }[]> {
    const response = await apiClient.get<AnalyticsApiResponse<any>>(
      `/api/analytics/revenue/breakdown?ownerId=${ownerId}&period=${period}`
    );
    return response.data.data;
  }

  async getProfitAnalysis(
    ownerId: string,
    propertyId?: string
  ): Promise<{
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    breakdown: { category: string; amount: number }[];
  }> {
    const params = new URLSearchParams({ ownerId });
    if (propertyId) params.append('propertyId', propertyId);

    const response = await apiClient.get<AnalyticsApiResponse<any>>(
      `/api/analytics/profit-analysis?${params}`
    );
    return response.data.data;
  }

  // Occupancy Analytics
  async getOccupancyAnalysis(
    ownerId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<{
    currentOccupancy: number;
    previousPeriod: number;
    marketAverage: number;
    trend: { date: string; occupancy: number }[];
    byProperty: { property: string; occupancy: number }[];
  }> {
    const response = await apiClient.get<AnalyticsApiResponse<any>>(
      `/api/analytics/occupancy?ownerId=${ownerId}&period=${period}`
    );
    return response.data.data;
  }

  // Guest Behavior Analytics
  async getGuestBehaviorInsights(
    ownerId: string
  ): Promise<{
    averageStayDuration: number;
    mostPopularAmenities: string[];
    bookingLeadTime: { period: string; percentage: number }[];
    seasonalPreferences: { season: string; bookings: number }[];
    repeatGuestAnalysis: {
      rate: number;
      averageSpend: number;
      loyaltyScore: number;
    };
  }> {
    const response = await apiClient.get<AnalyticsApiResponse<any>>(
      `/api/analytics/guest-behavior?ownerId=${ownerId}`
    );
    return response.data.data;
  }

  // Competitive Analysis
  async getCompetitiveAnalysis(
    ownerId: string,
    location: string
  ): Promise<{
    marketPosition: number; // percentile
    pricingComparison: { category: string; yourRate: number; marketRate: number }[];
    occupancyComparison: number;
    ratingComparison: number;
    amenityComparison: { amenity: string; youHave: boolean; marketPercentage: number }[];
  }> {
    const response = await apiClient.get<AnalyticsApiResponse<any>>(
      `/api/analytics/competitive-analysis?ownerId=${ownerId}&location=${location}`
    );
    return response.data.data;
  }

  // Export and Reporting
  async exportAnalyticsReport(
    ownerId: string,
    request: AnalyticsExportRequest
  ): Promise<{ reportId: string; estimatedTime: number }> {
    const response = await apiClient.post<AnalyticsApiResponse<any>>(
      `/api/analytics/export`,
      { ownerId, ...request }
    );
    return response.data.data;
  }

  async getExportStatus(reportId: string): Promise<{
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
    error?: string;
  }> {
    const response = await apiClient.get<AnalyticsApiResponse<any>>(
      `/api/analytics/export/${reportId}/status`
    );
    return response.data.data;
  }

  async getAnalyticsReports(ownerId: string): Promise<AnalyticsReport[]> {
    const response = await apiClient.get<AnalyticsApiResponse<AnalyticsReport[]>>(
      `/api/analytics/reports?ownerId=${ownerId}`
    );
    return response.data.data;
  }

  async deleteAnalyticsReport(reportId: string): Promise<void> {
    await apiClient.delete(`/api/analytics/reports/${reportId}`);
  }

  // Custom Analytics Queries
  async executeCustomQuery(
    ownerId: string,
    query: {
      metrics: string[];
      groupBy: string[];
      filters: Record<string, any>;
      dateRange: { from: Date; to: Date };
      aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
    }
  ): Promise<any[]> {
    const response = await apiClient.post<AnalyticsApiResponse<any[]>>(
      `/api/analytics/custom-query`,
      { ownerId, ...query }
    );
    return response.data.data;
  }

  // Alert and Threshold Management
  async createPerformanceAlert(
    ownerId: string,
    alert: {
      name: string;
      metric: string;
      condition: 'above' | 'below' | 'equals';
      threshold: number;
      frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
      enabled: boolean;
    }
  ): Promise<{ alertId: string }> {
    const response = await apiClient.post<AnalyticsApiResponse<any>>(
      '/api/analytics/alerts',
      { ownerId, ...alert }
    );
    return response.data.data;
  }

  async getPerformanceAlerts(ownerId: string): Promise<any[]> {
    const response = await apiClient.get<AnalyticsApiResponse<any[]>>(
      `/api/analytics/alerts?ownerId=${ownerId}`
    );
    return response.data.data;
  }

  async updatePerformanceAlert(
    alertId: string,
    updates: Partial<any>
  ): Promise<void> {
    await apiClient.put(`/api/analytics/alerts/${alertId}`, updates);
  }

  async deletePerformanceAlert(alertId: string): Promise<void> {
    await apiClient.delete(`/api/analytics/alerts/${alertId}`);
  }

  // WebSocket Real-time Updates
  initializeWebSocket(ownerId: string): void {
    if (this.wsConnection) {
      this.wsConnection.close();
    }

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/ws/analytics/${ownerId}`
      : `ws://localhost:8080/ws/analytics/${ownerId}`;

    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log('Analytics WebSocket connected');
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyCallbacks(data.type, data.payload);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('Analytics WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        this.initializeWebSocket(ownerId);
      }, 5000);
    };

    this.wsConnection.onerror = (error) => {
      console.error('Analytics WebSocket error:', error);
    };
  }

  onMetricUpdate(callback: (data: any) => void): () => void {
    return this.addCallback('metric_update', callback);
  }

  onBookingAlert(callback: (data: any) => void): () => void {
    return this.addCallback('booking_alert', callback);
  }

  onPerformanceAlert(callback: (data: any) => void): () => void {
    return this.addCallback('performance_alert', callback);
  }

  private addCallback(event: string, callback: Function): () => void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifyCallbacks(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in analytics callback:', error);
        }
      });
    }
  }

  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.callbacks.clear();
  }

  // Utility Methods
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  formatCurrency(amount: number, currency: string = 'ZAR'): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  calculateOccupancyRate(bookedDays: number, availableDays: number): number {
    if (availableDays === 0) return 0;
    return (bookedDays / availableDays) * 100;
  }

  calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  calculateRevenuePER(revenue: number, availableRooms: number): number {
    if (availableRooms === 0) return 0;
    return revenue / availableRooms;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;