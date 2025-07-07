import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OwnerRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/owner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md mt-12">
          <h1 className="text-2xl font-bold mb-6 text-center">Owner Registration</h1>
          {success ? (
            <div className="text-green-600 text-center mb-4">
              Registration successful! Please check your email to confirm your account.
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block mb-1 font-medium">Password</label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
              <Button type="submit" className="w-full btn-primary" disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</Button>
            </>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
} 