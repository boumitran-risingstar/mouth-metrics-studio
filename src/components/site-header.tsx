import Link from 'next/link';
import { AuthButton } from '@/components/auth-button';

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

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <ToothIcon className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline">Mouth Metrics Studio</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
