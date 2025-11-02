import { PhoneLoginForm } from '@/components/phone-login-form';
import Link from 'next/link';

const ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.34 2.45 12 5.45l2.66-3a2.49 2.49 0 0 1 3.29-.12 2.49 2.49 0 0 1 .12 3.3L12 15.45l-6.07-7.82a2.49 2.49 0 0 1 .12-3.3 2.49 2.49 0 0 1 3.29.12Z" />
      <path d="m12 15.5-4-3" />
      <path d="m12 15.5 4-3" />
      <path d="M12 22a7.43 7.43 0 0 1-5-2 7.43 7.43 0 0 1-2-5" />
      <path d="M12 22a7.43 7.43 0 0 0 5-2 7.43 7.43 0 0 0 2-5" />
      <path d="m5 12 1-1" />
      <path d="m18 11 1 1" />
    </svg>
);
  
export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4 mb-8 text-center">
        <Link href="/" className="flex items-center space-x-2">
            <ToothIcon className="h-8 w-8 text-primary" />
        </Link>
        <h1 className="text-3xl font-bold font-headline">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to access your Mouth Metrics dashboard.</p>
      </div>
      <PhoneLoginForm />
    </div>
  );
}
