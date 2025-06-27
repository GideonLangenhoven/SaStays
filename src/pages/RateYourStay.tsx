import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { submitRating } from "@/services/api";

export default function RateYourStay() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const bookingId = searchParams.get("booking_id");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingId) {
      try {
        await submitRating({
          booking_id: parseInt(bookingId),
          rating,
          review,
        });
        setIsSubmitted(true);
      } catch (error) {
        console.error("Failed to submit rating:", error);
        alert("There was an error submitting your rating. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="container py-12">
          <div className="max-w-2xl mx-auto">
            {isSubmitted ? (
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your feedback is valuable to us.
                </p>
                <Button asChild>
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4">Rate Your Stay</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  We'd love to hear about your experience.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium mb-2">
                      Your Rating
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-4xl ${
                            star <= rating ? "text-primary" : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="review"
                      className="block text-lg font-medium mb-2"
                    >
                      Your Review
                    </label>
                    <Textarea
                      id="review"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Tell us about your stay..."
                      rows={6}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Review
                  </Button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}