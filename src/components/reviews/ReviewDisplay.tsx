import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Users,
  Filter,
  Search,
  MoreHorizontal,
  Reply,
  Flag,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import reviewService, { Review } from '@/services/reviewService';

interface ReviewDisplayProps {
  propertyId: string;
  showAnalytics?: boolean;
  className?: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number; percentage: number }[];
  categoryAverages: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  };
}

export const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  propertyId,
  showAnalytics = false,
  className
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [propertyId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewData = await reviewService.getPropertyReviews(propertyId);
      setReviews(reviewData);
      calculateStats(reviewData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewData: Review[]) => {
    if (reviewData.length === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
        categoryAverages: {
          cleanliness: 0,
          communication: 0,
          checkIn: 0,
          accuracy: 0,
          location: 0,
          value: 0
        }
      });
      return;
    }

    const averageRating = reviewService.calculateAverageRating(reviewData);
    const ratingDistribution = reviewService.getRatingDistribution(reviewData);
    const categoryAverages = reviewService.calculateCategoryAverages(reviewData);

    setStats({
      totalReviews: reviewData.length,
      averageRating,
      ratingDistribution,
      categoryAverages
    });
  };

  const handleOwnerResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      setIsResponding(true);
      await reviewService.respondToReview(reviewId, responseText);
      setResponseText('');
      setSelectedReview(null);
      await loadReviews();
      toast.success('Response added successfully');
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Failed to add response');
    } finally {
      setIsResponding(false);
    }
  };

  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (filter !== 'all' && Math.round(review.rating) !== parseInt(filter)) {
      return false;
    }
    if (searchQuery && !review.review_text.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !review.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Section */}
      {showAnalytics && stats && (
        <div className="space-y-4">
          {/* Overall Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">{stats.averageRating}</div>
                <div className="flex justify-center mb-2">
                  {renderStarRating(stats.averageRating, 'md')}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Rating Breakdown</h4>
                <div className="space-y-2">
                  {stats.ratingDistribution.map((item) => (
                    <div key={item.rating} className="flex items-center space-x-2">
                      <span className="text-sm font-medium w-2">{item.rating}</span>
                      <Star className="h-3 w-3 text-yellow-400" />
                      <Progress value={item.percentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Category Averages</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cleanliness</span>
                    <span className="font-medium">{stats.categoryAverages.cleanliness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Communication</span>
                    <span className="font-medium">{stats.categoryAverages.communication}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-in</span>
                    <span className="font-medium">{stats.categoryAverages.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy</span>
                    <span className="font-medium">{stats.categoryAverages.accuracy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="font-medium">{stats.categoryAverages.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Value</span>
                    <span className="font-medium">{stats.categoryAverages.value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Guest Reviews ({stats?.totalReviews || 0})</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p>No reviews found</p>
              {searchQuery || filter !== 'all' ? (
                <p className="text-sm">Try adjusting your filters</p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review, index) => (
                <div key={review.id}>
                  {index > 0 && <Separator />}
                  <div className="py-4 first:pt-0 last:pb-0">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={review.customer_image} />
                          <AvatarFallback>
                            {review.customer_name?.charAt(0) || 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{review.customer_name || 'Guest'}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStarRating(review.rating)}
                        <Badge variant="outline" className="ml-2">
                          {review.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                    </div>

                    {/* Category Ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cleanliness</span>
                        <span className="font-medium">{review.cleanliness_rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Communication</span>
                        <span className="font-medium">{review.communication_rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check-in</span>
                        <span className="font-medium">{review.check_in_rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-medium">{review.accuracy_rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{review.location_rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-medium">{review.value_rating}/5</span>
                      </div>
                    </div>

                    {/* Owner Response */}
                    {review.owner_response && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">Host Response</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.updated_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{review.owner_response}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Was this helpful?</span>
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Yes
                        </Button>
                      </div>
                      
                      {!review.owner_response && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                              <Reply className="h-3 w-3 mr-1" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Respond to Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-semibold">{review.customer_name}</span>
                                  {renderStarRating(review.rating)}
                                </div>
                                <p className="text-sm text-gray-700">{review.review_text}</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">Your Response</label>
                                <Textarea
                                  value={responseText}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  placeholder="Thank the guest and address any concerns..."
                                  rows={4}
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  onClick={() => handleOwnerResponse(review.id)}
                                  disabled={isResponding || !responseText.trim()}
                                >
                                  {isResponding ? 'Submitting...' : 'Submit Response'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewDisplay;