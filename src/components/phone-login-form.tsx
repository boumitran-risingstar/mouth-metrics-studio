
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function PhoneLoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phoneNumber' | 'otp'>('phoneNumber');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!recaptchaContainerRef.current) return;

    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          setError("reCAPTCHA expired. Please try again.");
        }
    });
    window.recaptchaVerifier = verifier;

    return () => {
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const verifier = window.recaptchaVerifier!;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setStep('otp');
      toast({ title: 'OTP Sent!', description: 'A verification code has been sent to your phone.' });
    } catch (error: any) {
      setError(error.message);
      // Reset reCAPTCHA if something went wrong
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
            // @ts-ignore
            if (window.grecaptcha) {
                window.grecaptcha.reset(widgetId);
            }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!window.confirmationResult) {
        throw new Error("No confirmation result found. Please try sending OTP again.");
      }
      await window.confirmationResult.confirm(otp);
      toast({ title: 'Success!', description: 'You have been successfully signed in.' });
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          {step === 'phoneNumber' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 555 5555"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  autoComplete="tel"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoComplete="one-time-code"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          )}
        </CardContent>
        {step === 'otp' && (
             <CardFooter>
                <Button variant="link" onClick={() => { setStep('phoneNumber'); setError(null); }} className="w-full text-muted-foreground">
                    Entered the wrong number?
                </Button>
             </CardFooter>
        )}
      </Card>
      <div ref={recaptchaContainerRef} id="recaptcha-container" className="mt-4"></div>
    </>
  );
}
