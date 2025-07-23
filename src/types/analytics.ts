// Comprehensive Analytics Types for SaStays Platform

export interface AnalyticsMetrics {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  todayEarnings: number;
  pendingPayouts: number;
  nextPayoutDate: string;
  totalBookings: number;
  totalGuests: number;
  averageBookingValue: number;
  averageStayDuration: number;
  occupancyRate: number;
  repeatGuestRate: number;
  cancellationRate: number;
  averageRating: number;
  responseTime: number;
  conversionRate: number;
  netPromoterScore: number;
  revenuePerAvailableRoom: number;
}

export interface MonthlyTrendData {
  month: string;
  earnings: number;
  bookings: number;
  occupancy: number;
  avgRating: number;
  guests: number;
  revenue: number;
  expenses: number;
  profit: number;
  inquiries: number;
  conversions: number;
}

export interface PropertyPerformance {
  name: string;
  earnings: number;
  bookings: number;
  occupancy: number;
  avgRating: number;
  revenue: number;
  expenses: number;
  profit: number;
  avgDailyRate: number;
  totalDays: number;
  guestReviews: number;
  repeatGuests: number;
  cancellations: number;
  inquiries: number;
  conversions: number;
  responseTime: number;
}

export interface RevenueBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface GuestSatisfactionData {
  overallRating: number;
  reviewCount: number;
  ratingDistribution: RatingDistribution[];
  categoryRatings: CategoryRating[];
  recentReviews: GuestReview[];
}

export interface RatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

export interface CategoryRating {
  category: string;
  rating: number;
  reviews: number;
}

export interface GuestReview {
  id: number;
  guest: string;
  property: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface MarketInsights {
  localOccupancyRate: number;
  averageMarketRate: number;
  yourPremium: number;
  seasonalTrends: SeasonalTrend[];
  competitorPricing: CompetitorPricing[];
}

export interface SeasonalTrend {
  month: string;
  market: number;
  yours: number;
}

export interface CompetitorPricing {
  category: string;
  avgRate: number;
  count: number;
}

export interface RevenueOptimization {
  pricingRecommendations: PricingRecommendation[];
  occupancyOptimization: OccupancyOptimization[];
}

export interface PricingRecommendation {
  property: string;
  currentRate: number;
  recommendedRate: number;
  potentialIncrease: number;
  confidence: number;
  reason: string;
}

export interface OccupancyOptimization {
  property: string;
  currentOccupancy: number;
  targetOccupancy: number;
  suggestedActions: string[];
}

export interface GuestAnalytics {
  demographics: GuestDemographic[];
  bookingPatterns: BookingPattern[];
  topSourceMarkets: SourceMarket[];
}

export interface GuestDemographic {
  segment: string;
  percentage: number;
  avgStay: number;
  avgSpend: number;
}

export interface BookingPattern {
  period: string;
  bookings: number;
  percentage: number;
}

export interface SourceMarket {
  market: string;
  bookings: number;
  revenue: number;
}

export interface AnalyticsDashboardData {
  metrics: AnalyticsMetrics;
  monthlyTrend: MonthlyTrendData[];
  propertyPerformance: PropertyPerformance[];
  revenueBreakdown: RevenueBreakdown[];
  guestSatisfaction: GuestSatisfactionData;
  marketInsights: MarketInsights;
  revenueOptimization: RevenueOptimization;
  guestAnalytics: GuestAnalytics;
}

export interface AnalyticsFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  propertyIds?: string[];
  guestSegment?: string;
  bookingSource?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface AnalyticsApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

// Benchmarks for performance evaluation
export interface PerformanceBenchmarks {
  occupancy: {
    excellent: number;
    good: number;
    poor: number;
  };
  rating: {
    excellent: number;
    good: number;
    poor: number;
  };
  responseTime: {
    excellent: number;
    good: number;
    poor: number;
  };
  conversionRate: {
    excellent: number;
    good: number;
    poor: number;
  };
}

// Chart data interfaces
export interface ChartDatapoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface TimeSeriesDatapoint {
  timestamp: Date;
  value: number;
  metric: string;
}

// Export request interfaces
export interface AnalyticsExportRequest {
  format: 'csv' | 'pdf' | 'json' | 'xlsx';
  dateRange: {
    from: Date;
    to: Date;
  };
  includeCharts: boolean;
  sections: string[];
  propertyIds?: string[];
}

export interface AnalyticsReport {
  id: string;
  title: string;
  generatedAt: Date;
  format: string;
  size: number;
  downloadUrl: string;
  expiresAt: Date;
}

// Real-time analytics interfaces
export interface RealTimeMetrics {
  currentOccupancy: number;
  todayBookings: number;
  activeInquiries: number;
  averageResponseTime: number;
  onlineViewers: number;
  recentActivity: ActivityEvent[];
}

export interface ActivityEvent {
  id: string;
  type: 'booking' | 'inquiry' | 'review' | 'cancellation' | 'payout';
  timestamp: Date;
  property: string;
  guest?: string;
  amount?: number;
  description: string;
}

// Predictive analytics interfaces
export interface PredictiveAnalytics {
  nextMonthRevenue: RevenuePredicition;
  occupancyForecast: OccupancyForecast[];
  demandForecast: DemandForecast[];
  pricingOpportunities: PricingOpportunity[];
}

export interface RevenuePredicition {
  predicted: number;
  confidence: number;
  factors: string[];
  range: {
    min: number;
    max: number;
  };
}

export interface OccupancyForecast {
  date: Date;
  predictedOccupancy: number;
  confidence: number;
  property: string;
}

export interface DemandForecast {
  period: string;
  demandLevel: 'low' | 'medium' | 'high' | 'peak';
  confidence: number;
  suggestedActions: string[];
}

export interface PricingOpportunity {
  property: string;
  dates: Date[];
  currentRate: number;
  suggestedRate: number;
  potentialIncrease: number;
  confidence: number;
}

export default AnalyticsDashboardData;