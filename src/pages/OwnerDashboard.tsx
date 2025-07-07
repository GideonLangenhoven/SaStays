import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: number;
  property_id: number;
  property_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  payment_provider: string;
}

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [propertyAvailability, setPropertyAvailability] = useState<Record<number, string[]>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('owner_jwt');
    if (!token) {
      navigate('/owner-login');
      return;
    }
    fetch('http://localhost:5001/api/bookings/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('owner_jwt');
          navigate('/owner-login');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message !== 'Unauthorized') {
          setError('Failed to fetch bookings.');
          setLoading(false);
        }
      });
  }, [navigate]);

  useEffect(() => {
    // Fetch unavailable dates for each property
    const propertyIds = Array.from(new Set(bookings.map(b => b.property_id)));
    propertyIds.forEach(id => {
      fetch(`http://localhost:5001/api/properties/${id}/availability`)
        .then(res => res.json())
        .then(dates => setPropertyAvailability(prev => ({ ...prev, [id]: dates })))
        .catch(() => {});
    });
  }, [bookings]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 container">
        <h1 className="text-3xl font-bold mb-6 mt-8">Owner Dashboard</h1>
        {loading ? (
          <div>Loading bookings...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">All Bookings</h2>
            <div className="overflow-x-auto mb-12">
              <table className="min-w-full border rounded-lg bg-card">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-3 py-2 text-left">Property</th>
                    <th className="px-3 py-2 text-left">Customer</th>
                    <th className="px-3 py-2 text-left">Dates</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-b last:border-b-0">
                      <td className="px-3 py-2">{b.property_name}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{b.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{b.customer_email}</div>
                        <div className="text-xs text-muted-foreground">{b.customer_phone}</div>
                      </td>
                      <td className="px-3 py-2">
                        {format(parseISO(b.start_date), 'yyyy-MM-dd')}<br />
                        to<br />
                        {format(parseISO(b.end_date), 'yyyy-MM-dd')}
                      </td>
                      <td className="px-3 py-2 capitalize">{b.status}</td>
                      <td className="px-3 py-2">
                        <div>{b.payment_provider}</div>
                        <div className="text-xs text-muted-foreground">R{b.total_price.toLocaleString('en-ZA')}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 className="text-xl font-semibold mb-4">Property Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(propertyAvailability).map(([propertyId, dates]) => (
                <div key={propertyId} className="bg-muted rounded-lg p-4">
                  <div className="font-semibold mb-2">Property ID: {propertyId}</div>
                  <div className="text-xs mb-2">Unavailable Dates:</div>
                  <ul className="text-xs space-y-1">
                    {(dates as string[]).length === 0 ? (
                      <li className="text-green-600">All dates available</li>
                    ) : (
                      (dates as string[]).map(date => (
                        <li key={date} className="text-red-600">{date}</li>
                      ))
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
} 