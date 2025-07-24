import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const BookingConfirmation: React.FC = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const bookingId = searchParams.get('booking_id');

    let statusConfig = {
        icon: Clock,
        title: 'Unknown Status',
        description: 'There was an issue processing your booking. Please contact support.',
        color: 'text-gray-500',
    };

    switch (status) {
        case 'success':
            statusConfig = {
                icon: CheckCircle2,
                title: 'Booking Confirmed!',
                description: 'Your payment was successful and your booking is confirmed. A confirmation email has been sent to you.',
                color: 'text-green-500',
            };
            break;
        case 'pending_approval':
             statusConfig = {
                icon: Clock,
                title: 'Request Sent!',
                description: 'Your booking request has been sent to the property owner for approval. You will be notified via email once they respond.',
                color: 'text-blue-500',
            };
            break;
        case 'cancelled':
            statusConfig = {
                icon: XCircle,
                title: 'Booking Cancelled',
                description: 'Your booking was cancelled. If you completed payment and believe this is an error, please contact us.',
                color: 'text-red-500',
            };
            break;
    }

    const Icon = statusConfig.icon;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex items-center justify-center p-4 bg-muted/40">
                <Card className="w-full max-w-lg text-center shadow-lg">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Icon className={`h-10 w-10 ${statusConfig.color}`} />
                        </div>
                        <CardTitle className="text-2xl">{statusConfig.title}</CardTitle>
                        <CardDescription>{statusConfig.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {bookingId && (
                             <p className="text-sm text-muted-foreground">
                                Booking Reference: #{bookingId}
                            </p>
                        )}
                        <Button asChild className="mt-6">
                            <Link to="/">Back to Homepage</Link>
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default BookingConfirmation;