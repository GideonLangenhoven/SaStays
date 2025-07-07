import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

export default function RateYourStay() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // For demo, ask user for email to match booking (in real app, use a token)
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (!bookingId || !email || rating === 0) {
      setError('Please provide all required fields.');
      setIsLoading(false);
      return;
    }
    try {
      // Fetch booking to get customer_id and property_id
      const bookingRes = await fetch(`http://localhost:5001/api/bookings/by-id/${bookingId}?email=${encodeURIComponent(email)}`);
      if (!bookingRes.ok) throw new Error('Booking not found.');
      const booking = await bookingRes.json();
      const res = await fetch('http://localhost:5001/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          customer_id: booking.customer_id,
          property_id: booking.property_id,
          rating,
          review
        })
        });
      if (!res.ok) throw new Error('Failed to submit rating.');
      setSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sea-light to-white dark:from-sea-dark dark:to-background">
      <div className="w-full max-w-md bg-white dark:bg-card rounded-lg shadow-lg p-8 mt-12">
        {submitted ? (
              <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Thank you for your feedback!</h2>
            <p className="text-muted-foreground mb-4">Your review helps us improve and helps future guests.</p>
            <Button asChild className="btn-primary mt-4"><a href="/">Return to Homepage</a></Button>
              </div>
            ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-4 text-center">Rate Your Stay</h2>
            <div className="mb-4">
              <Label htmlFor="email">Email used for booking</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="mb-4 flex items-center gap-2">
              <Label className="mr-2">Your Rating:</Label>
              {[1,2,3,4,5].map(star => (
                <Star
                          key={star}
                  size={28}
                  className={
                    (hoverRating || rating) >= star
                      ? 'text-yellow-400 fill-yellow-400 cursor-pointer'
                      : 'text-gray-300 cursor-pointer'
                  }
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                  data-testid={`star-${star}`}
                />
                      ))}
                    </div>
            <div className="mb-4">
              <Label htmlFor="review">Your Review (optional)</Label>
              <Textarea id="review" value={review} onChange={e => setReview(e.target.value)} rows={4} placeholder="Share your experience..." />
                  </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <Button type="submit" className="w-full btn-primary" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Review'}</Button>
                </form>
            )}
          </div>
    </div>
  );
}