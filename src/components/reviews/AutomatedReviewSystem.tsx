// src/components/reviews/AutomatedReviewSystem.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Star, MessageSquare, Calendar, User, TrendingUp, Send } from 'lucide-react';

interface Review {
  id: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  propertyId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  checkInDate: Date;
  checkOutDate: Date;
  verified: boolean;
  status: 'pending' | 'published' | 'hidden';
  ownerResponse?: string;
  ownerResponseDate?: Date;
}

interface PendingReviewRequest {
  id: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  checkOutDate: Date;
  emailSentAt: Date;
  remindersSent: number;
  status: 'sent' | 'completed' | 'expired';
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  ratingDistribution: { [key: number]: number };
  recentTrend: 'up' | 'down' | 'stable';
}

export const AutomatedReviewSystem: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingReviewRequest[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'pending' | 'stats'>('reviews');
  const { toast } = useToast();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reviewsRes, pendingRes, statsRes] = await Promise.all([
          fetch('/api/reviews'),
          fetch('/api/reviews/pending-requests'),
          fetch('/api/reviews/stats')
        ]);

        const [reviewsData, pendingData, statsData] = await Promise.all([
          reviewsRes.json(),
          pendingRes.json(),
          statsRes.json()
        ]);

        setReviews(reviewsData.map((review: any) => ({
          ...review,
          createdAt: new Date(review.createdAt),
          checkInDate: new Date(review.checkInDate),
          checkOutDate: new Date(review.checkOutDate),
          ownerResponseDate: review.ownerResponseDate ? new Date(review.ownerResponseDate) : undefined
        })));

        setPendingRequests(pendingData.map((request: any) => ({
          ...request,
          checkOutDate: new Date(request.checkOutDate),
          emailSentAt: new Date(request.emailSentAt)
        })));

        setStats(statsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load review data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const sendReviewReminder = async (requestId: string) => {
    try {
      const response = await fetch(`/api/reviews/send-reminder/${requestId}`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "Reminder sent",
          description: "Review reminder has been sent to the guest"
        });
        
        // Update pending requests
        setPendingRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, remindersSent: req.remindersSent + 1 }
            : req
        ));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive"
      });
    }
  };

  const respondToReview = async (reviewId: string, response: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });

      if (res.ok) {
        toast({
          title: "Response saved",
          description: "Your response has been published"
        });

        // Update reviews
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                ownerResponse: response, 
                ownerResponseDate: new Date() 
              }
            : review
        ));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderReviews = () => (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>
                  {review.guestName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{review.guestName}</h4>
                    <p className="text-sm text-gray-600">{review.propertyTitle}</p>
                  </div>
                  <div className="text-right">
                    {renderStars(review.rating)}
                    <p className="text-sm text-gray-500 mt-1">
                      {format(review.createdAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={review.verified ? 'default' : 'secondary'}>
                    {review.verified ? 'Verified Stay' : 'Unverified'}
                  </Badge>
                  <Badge variant={review.status === 'published' ? 'default' : 'secondary'}>
                    {review.status}
                  </Badge>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                {review.ownerResponse ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-sm">Your Response</span>
                      <span className="text-xs text-gray-500">
                        {review.ownerResponseDate && format(review.ownerResponseDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm">{review.ownerResponse}</p>
                  </div>
                ) : (
                  <RespondToReview
                    reviewId={review.id}
                    onRespond={(response) => respondToReview(review.id, response)}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderPendingRequests = () => (
    <div className="space-y-4">
      {pendingRequests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{request.guestName}</h4>
                <p className="text-sm text-gray-600">{request.propertyTitle}</p>
                <p className="text-xs text-gray-500">
                  Checked out: {format(request.checkOutDate, 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-gray-500">
                  Email sent: {format(request.emailSentAt, 'MMM d, yyyy')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                  {request.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  {request.remindersSent} reminder{request.remindersSent !== 1 ? 's' : ''}
                </span>
                {request.status === 'sent' && request.remindersSent < 2 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendReviewReminder(request.id)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Remind
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStats = () => {
    if (!stats) return <div>Loading stats...</div>;

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overview Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Review Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Total Reviews</span>
                <span className="font-semibold">{stats.totalReviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Rating</span>
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(stats.averageRating))}
                  <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Response Rate</span>
                <span className="font-semibold">{stats.responseRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trend</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`h-4 w-4 ${
                    stats.recentTrend === 'up' ? 'text-green-500' : 
                    stats.recentTrend === 'down' ? 'text-red-500' : 
                    'text-gray-500'
                  }`} />
                  <span className="capitalize">{stats.recentTrend}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm">{rating}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Guest Reviews</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === 'reviews' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Reviews ({reviews.length})
          </Button>
          <Button
            variant={activeTab === 'pending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('pending')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Pending ({pendingRequests.length})
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('stats')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Stats
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      ) : (
        <>
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'pending' && renderPendingRequests()}
          {activeTab === 'stats' && renderStats()}
        </>
      )}
    </div>
  );
};

// Component for responding to reviews
const RespondToReview: React.FC<{
  reviewId: string;
  onRespond: (response: string) => void;
}> = ({ reviewId, onRespond }) => {
  const [showForm, setShowForm] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmit = () => {
    if (response.trim()) {
      onRespond(response.trim());
      setShowForm(false);
      setResponse('');
    }
  };

  if (!showForm) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowForm(true)}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Respond to Review
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your response to this review..."
        className="w-full p-3 border rounded-lg resize-none"
        rows={3}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!response.trim()}>
          Post Response
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AutomatedReviewSystem;