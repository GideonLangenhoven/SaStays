
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QrCodeIcon, CreditCard, Zap, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import apiService from '@/services/api';
import { PaymentMethodEnum } from '@/types';

// Types
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    bookingId: string;
    propertyTitle: string;
    dates: string;
    guests: number;
    totalAmount: number;
  };
  onPaymentSuccess: (paymentReference: string) => void;
}

interface PaymentMethod {
  id: PaymentMethodEnum;
  name: string;
  displayName: string;
  icon: React.ReactNode;
  type: 'qr' | 'redirect';
  description: string;
  processingTime: string;
  isEnabled: boolean;
}

// Constants
const PAYMENT_METHODS: PaymentMethod[] = [
  { id: PaymentMethodEnum.OZOW, name: 'ozow', displayName: 'Ozow', icon: <Zap className="h-5 w-5" />, type: 'redirect', description: 'Instant bank transfer', processingTime: 'Instant', isEnabled: true },
  { id: PaymentMethodEnum.ZAPPER, name: 'zapper', displayName: 'Zapper', icon: <QrCodeIcon className="h-5 w-5" />, type: 'qr', description: 'Scan QR code to pay', processingTime: 'Instant', isEnabled: true },
  { id: PaymentMethodEnum.SNAPSCAN, name: 'snapscan', displayName: 'SnapScan', icon: <QrCodeIcon className="h-5 w-5" />, type: 'qr', description: 'Scan to pay with SnapScan', processingTime: 'Instant', isEnabled: true },
  { id: PaymentMethodEnum.PAYFAST, name: 'payfast', displayName: 'PayFast', icon: <CreditCard className="h-5 w-5" />, type: 'redirect', description: 'Credit/Debit cards & more', processingTime: '1-2 minutes', isEnabled: true },
];

// Sub-components
const BookingSummary = ({ bookingData }: { bookingData: PaymentModalProps['bookingData'] }) => (
  <Card className="mb-4 bg-muted/50">
    <CardHeader className="pb-3">
      <CardTitle className="text-base">{bookingData.propertyTitle}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      <div className="flex justify-between"><span>Dates:</span><span>{bookingData.dates}</span></div>
      <div className="flex justify-between"><span>Guests:</span><span>{bookingData.guests}</span></div>
      <Separator />
      <div className="flex justify-between font-semibold text-base"><span>Total:</span><span>R{bookingData.totalAmount.toLocaleString()}</span></div>
    </CardContent>
  </Card>
);

const PaymentMethodSelection = ({ onSelect, isProcessing }: { onSelect: (method: PaymentMethod) => void, isProcessing: boolean }) => (
  <div className="space-y-4">
    <div className="text-center space-y-1"><h3 className="text-lg font-semibold">Choose Payment Method</h3><p className="text-sm text-muted-foreground">Select your preferred payment option</p></div>
    <div className="grid gap-3">
      {PAYMENT_METHODS.filter(m => m.isEnabled).map(method => (
        <Card key={method.id} className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50" onClick={() => !isProcessing && onSelect(method)}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">{method.icon}</div><div><h4 className="font-medium">{method.displayName}</h4><p className="text-sm text-muted-foreground">{method.description}</p></div></div>
            <Badge variant="secondary" className="text-xs hidden sm:flex"><Clock className="h-3 w-3 mr-1" />{method.processingTime}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2"><Shield className="h-4 w-4" /><span>Payments are secured with bank-level encryption</span></div>
  </div>
);

const QRPayment = ({ method, qrCodeData, countdown, onBack }: { method: PaymentMethod, qrCodeData: string, countdown: number, onBack: () => void }) => (
  <div className="text-center space-y-6">
    <div><h3 className="text-lg font-semibold">Scan to Pay with {method.displayName}</h3><p className="text-sm text-muted-foreground">Open your app and scan the code below</p></div>
    <div className="flex justify-center"><div className="p-4 bg-white rounded-lg border-2"><QRCodeSVG value={qrCodeData} size={200} /></div></div>
    <div className="space-y-1"><div className="text-2xl font-mono font-bold text-primary">{`${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`}</div><p className="text-xs text-muted-foreground">QR code expires soon</p></div>
    <div className="flex items-center justify-center gap-2"><div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-sm">Waiting for payment...</span></div>
    <Button variant="outline" onClick={onBack}>Choose Different Method</Button>
  </div>
);

const RedirectPayment = ({ method, paymentUrl, onBack }: { method: PaymentMethod, paymentUrl: string, onBack: () => void }) => (
  <div className="text-center space-y-6">
    <div><h3 className="text-lg font-semibold">Complete Payment</h3><p className="text-sm text-muted-foreground">You've been redirected to {method.displayName} to complete your payment.</p></div>
    <div className="flex items-center justify-center gap-2"><div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-sm">Waiting for payment confirmation...</span></div>
    <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
      <p className="text-sm text-muted-foreground">If the payment window didn't open:</p>
      <Button variant="secondary" onClick={() => window.open(paymentUrl, '_blank')} className="w-full">Re-open Payment Window</Button>
    </div>
    <Button variant="outline" onClick={onBack}>Choose Different Method</Button>
  </div>
);

const StatusDisplay = ({ status, reference, onRetry }: { status: 'success' | 'failed', reference?: string, onRetry?: () => void }) => (
  <div className="text-center space-y-6 py-8">
    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto", status === 'success' ? 'bg-green-100' : 'bg-red-100')}>
      {status === 'success' ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
    </div>
    <div>
      <h3 className={cn("text-xl font-semibold mb-2", status === 'success' ? 'text-green-600' : 'text-red-600')}>
        {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {status === 'success' ? "Your booking is confirmed. You'll receive an email shortly." : "There was an issue with your payment."}
      </p>
    </div>
    {reference && <p className="text-xs text-muted-foreground">Ref: {reference}</p>}
    {status === 'failed' && <Button onClick={onRetry}>Try Again</Button>}
  </div>
);

// Main Component
export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bookingData, onPaymentSuccess }) => {
  const [state, setState] = useState({ method: null as PaymentMethod | null, isProcessing: false, paymentUrl: '', reference: '', qrCodeData: '', status: 'pending' as 'pending' | 'processing' | 'success' | 'failed', countdown: 0 });

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setState({ method: null, isProcessing: false, paymentUrl: '', reference: '', qrCodeData: '', status: 'pending', countdown: 0 }), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Payment status polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.reference && state.status === 'processing') {
      interval = setInterval(async () => {
        try {
          const res = await apiService.payments.verify(state.reference);
          if (res.success && res.data?.status === 'paid') {
            setState(s => ({ ...s, status: 'success' }));
            onPaymentSuccess(state.reference);
            toast.success('Payment successful!');
            setTimeout(onClose, 3000);
          } else if (res.data?.status === 'failed') {
            setState(s => ({ ...s, status: 'failed' }));
            toast.error('Payment failed. Please try again.');
          }
        } catch (error) { console.error('Error checking payment status:', error); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [state.reference, state.status, onPaymentSuccess, onClose]);

  // QR code countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.countdown > 0) {
      timer = setTimeout(() => setState(s => ({ ...s, countdown: s.countdown - 1 })), 1000);
    } else if (state.countdown === 0 && state.qrCodeData) {
      handleSelect(state.method!); // Refresh QR code
    }
    return () => clearTimeout(timer);
  }, [state.countdown, state.qrCodeData, state.method]);

  const handleSelect = async (method: PaymentMethod) => {
    setState(s => ({ ...s, method, isProcessing: true }));
    try {
      const res = await apiService.payments.initiate(bookingData.bookingId, method.name);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to initiate payment');
      
      setState(s => ({ ...s, reference: res.data.reference, status: 'processing' }));
      if (method.type === 'redirect') {
        setState(s => ({ ...s, paymentUrl: res.data.paymentUrl }));
        window.open(res.data.paymentUrl, '_blank');
      } else if (method.type === 'qr') {
        setState(s => ({ ...s, qrCodeData: res.data.paymentUrl, countdown: 300 }));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
      setState(s => ({ ...s, method: null }));
    } finally {
      setState(s => ({ ...s, isProcessing: false }));
    }
  };

  const resetSelection = () => setState(s => ({ ...s, method: null, status: 'pending', reference: '', qrCodeData: '', paymentUrl: '' }));

  const renderContent = () => {
    if (state.status === 'success') return <StatusDisplay status="success" reference={state.reference} />;
    if (state.status === 'failed') return <StatusDisplay status="failed" onRetry={resetSelection} />;
    if (state.method) {
      if (state.method.type === 'qr') return <QRPayment method={state.method} qrCodeData={state.qrCodeData} countdown={state.countdown} onBack={resetSelection} />;
      if (state.method.type === 'redirect') return <RedirectPayment method={state.method} paymentUrl={state.paymentUrl} onBack={resetSelection} />;
    }
    return <PaymentMethodSelection onSelect={handleSelect} isProcessing={state.isProcessing} />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>Securely pay for your booking.</DialogDescription>
        </DialogHeader>
        <BookingSummary bookingData={bookingData} />
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
