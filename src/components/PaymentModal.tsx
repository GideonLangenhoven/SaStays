// src/components/PaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCodeIcon, CreditCard, Smartphone, Zap, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode.react';
import { cn } from '@/lib/utils';
import apiService from '@/services/api';
import { PaymentMethodEnum } from '@/types';

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
  type: 'qr' | 'redirect' | 'form';
  description: string;
  processingTime: string;
  isEnabled: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: PaymentMethodEnum.OZOW,
    name: 'ozow',
    displayName: 'Ozow',
    icon: <Zap className="h-5 w-5" />,
    type: 'redirect',
    description: 'Instant bank transfer',
    processingTime: 'Instant',
    isEnabled: true,
  },
  {
    id: PaymentMethodEnum.ZAPPER,
    name: 'zapper',
    displayName: 'Zapper',
    icon: <QrCodeIcon className="h-5 w-5" />,
    type: 'qr',
    description: 'Scan QR code to pay',
    processingTime: 'Instant',
    isEnabled: true,
  },
  {
    id: PaymentMethodEnum.SNAPSCAN,
    name: 'snapscan',
    displayName: 'SnapScan',
    icon: <QrCodeIcon className="h-5 w-5" />,
    type: 'qr',
    description: 'Scan to pay with SnapScan',
    processingTime: 'Instant',
    isEnabled: true,
  },
  {
    id: PaymentMethodEnum.PAYFAST,
    name: 'payfast',
    displayName: 'PayFast',
    icon: <CreditCard className="h-5 w-5" />,
    type: 'redirect',
    description: 'Credit/Debit cards & more',
    processingTime: '1-2 minutes',
    isEnabled: true,
  },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [countdown, setCountdown] = useState<number>(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMethod(null);
      setIsProcessing(false);
      setPaymentUrl('');
      setPaymentReference('');
      setQrCodeData('');
      setPaymentStatus('pending');
      setCountdown(0);
    }
  }, [isOpen]);

  // Payment status polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (paymentReference && paymentStatus === 'processing') {
      interval = setInterval(async () => {
        try {
          const response = await apiService.payments.verify(paymentReference);
          if (response.success && response.data?.status === 'paid') {
            setPaymentStatus('success');
            onPaymentSuccess(paymentReference);
            toast.success('Payment successful!');
            setTimeout(() => onClose(), 2000);
          } else if (response.data?.status === 'failed') {
            setPaymentStatus('failed');
            toast.error('Payment failed. Please try again.');
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentReference, paymentStatus, onPaymentSuccess, onClose]);

  // Countdown timer for QR codes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && qrCodeData) {
      // Refresh QR code when countdown reaches 0
      handlePaymentMethodSelect(selectedMethod!);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, qrCodeData, selectedMethod]);

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsProcessing(true);

    try {
      const response = await apiService.payments.initiate(bookingData.bookingId, method.name);
      
      if (response.success && response.data) {
        setPaymentReference(response.data.reference);
        
        if (method.type === 'redirect') {
          setPaymentUrl(response.data.paymentUrl);
          setPaymentStatus('processing');
          // Open payment URL in new window/tab
          window.open(response.data.paymentUrl, '_blank');
        } else if (method.type === 'qr') {
          setQrCodeData(response.data.paymentUrl);
          setPaymentStatus('processing');
          setCountdown(300); // 5 minutes
        }
      } else {
        throw new Error(response.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setSelectedMethod(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPaymentMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred payment option below
        </p>
      </div>

      <div className="grid gap-3">
        {PAYMENT_METHODS.filter(method => method.isEnabled).map((method) => (
          <Card
            key={method.id}
            className={cn(
              'cursor-pointer transition-colors hover:bg-accent/50 border-2',
              selectedMethod?.id === method.id && 'border-primary bg-primary/5'
            )}
            onClick={() => !isProcessing && handlePaymentMethodSelect(method)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{method.displayName}</h4>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {method.processingTime}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
        <Shield className="h-4 w-4" />
        <span>Payments are secured with bank-level encryption</span>
      </div>
    </div>
  );

  const renderQRPayment = () => (
    <div className="text-center space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Scan to Pay</h3>
        <p className="text-sm text-muted-foreground">
          Open your {selectedMethod?.displayName} app and scan the QR code
        </p>
      </div>

      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
          <QRCode value={qrCodeData} size={200} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-mono font-bold text-primary">
          {formatTime(countdown)}
        </div>
        <p className="text-xs text-muted-foreground">
          QR code expires in {formatTime(countdown)}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm">Waiting for payment...</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Payment will be confirmed automatically
        </p>
      </div>

      <Button variant="outline" onClick={() => setSelectedMethod(null)}>
        Choose Different Method
      </Button>
    </div>
  );

  const renderRedirectPayment = () => (
    <div className="text-center space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Complete Payment</h3>
        <p className="text-sm text-muted-foreground">
          A new window has opened to complete your payment with {selectedMethod?.displayName}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm">Waiting for payment confirmation...</span>
        </div>

        <div className="border rounded-lg p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground mb-3">
            If the payment window didn't open automatically:
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.open(paymentUrl, '_blank')}
            className="w-full"
          >
            Open Payment Window
          </Button>
        </div>
      </div>

      <Button variant="outline" onClick={() => setSelectedMethod(null)}>
        Choose Different Method
      </Button>
    </div>
  );

  const renderPaymentSuccess = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-green-600 mb-2">Payment Successful!</h3>
        <p className="text-sm text-muted-foreground">
          Your booking has been confirmed. You'll receive a confirmation email shortly.
        </p>
      </div>

      <div className="text-xs text-muted-foreground">
        Reference: {paymentReference}
      </div>
    </div>
  );

  const renderPaymentFailed = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">Payment Failed</h3>
        <p className="text-sm text-muted-foreground">
          There was an issue processing your payment. Please try again.
        </p>
      </div>

      <Button onClick={() => {
        setSelectedMethod(null);
        setPaymentStatus('pending');
        setPaymentReference('');
      }}>
        Try Again
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
        </DialogHeader>

        {/* Booking Summary */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{bookingData.propertyTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Dates:</span>
              <span>{bookingData.dates}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Guests:</span>
              <span>{bookingData.guests}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>R{bookingData.totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Content */}
        {paymentStatus === 'pending' && !selectedMethod && renderPaymentMethodSelection()}
        {paymentStatus === 'processing' && selectedMethod?.type === 'qr' && renderQRPayment()}
        {paymentStatus === 'processing' && selectedMethod?.type === 'redirect' && renderRedirectPayment()}
        {paymentStatus === 'success' && renderPaymentSuccess()}
        {paymentStatus === 'failed' && renderPaymentFailed()}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;