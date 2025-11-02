import Link from 'next/link';
import { Button } from '@/components/ui/button';

const HeroSvg = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        {...props}
    >
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="15" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#glow)">
        <path 
            fill="url(#grad1)"
            d="M 125,100 C 50,125 50,225 100,275 C 100,350 150,425 250,425 C 350,425 400,350 400,275 C 450,225 450,125 375,100 C 325,50 175,50 125,100 Z"
        />
        </g>
        
        {/* Decorative Shapes */}
        <g opacity="0.7" transform="translate(130, 180) scale(0.4)">
            <circle cx="20" cy="80" r="10" fill="hsl(var(--primary-foreground))" opacity="0.6">
                 <animate attributeName="cy" from="100" to="80" dur="1.5s" fill="freeze" repeatCount="indefinite" direction="alternate" />
            </circle>
            <rect x="300" y="20" width="20" height="20" rx="5" fill="hsl(var(--primary-foreground))" opacity="0.7">
                <animateTransform attributeName="transform" type="rotate" from="0 310 30" to="360 310 30" dur="5s" repeatCount="indefinite" />
            </rect>
             <circle cx="320" cy="220" r="8" fill="hsl(var(--primary-foreground))" opacity="0.5">
                <animate attributeName="cx" from="310" to="330" dur="2s" fill="freeze" repeatCount="indefinite" direction="alternate" />
            </circle>
        </g>

        {/* Bar Chart Elements */}
        <g opacity="0.8" transform="translate(150, 200) scale(0.4)">
            <rect x="50" y="180" width="40" height="70" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.6">
                 <animate attributeName="y" from="250" to="180" dur="1s" fill="freeze" />
                 <animate attributeName="height" from="0" to="70" dur="1s" fill="freeze" />
            </rect>
            <rect x="110" y="150" width="40" height="100" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.7">
                 <animate attributeName="y" from="250" to="150" dur="1s" begin="0.2s" fill="freeze" />
                 <animate attributeName="height" from="0" to="100" dur="1s" begin="0.2s" fill="freeze" />
            </rect>
            <rect x="170" y="120" width="40" height="130" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.75">
                 <animate attributeName="y" from="250" to="120" dur="1s" begin="0.4s" fill="freeze" />
                 <animate attributeName="height" from="0" to="130" dur="1s" begin="0.4s" fill="freeze" />
            </rect>
            <rect x="230" y="100" width="40" height="150" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.8">
                <animate attributeName="y" from="250" to="100" dur="1s" begin="0.6s" fill="freeze" />
                <animate attributeName="height" from="0" to="150" dur="1s" begin="0.6s" fill="freeze" />
            </rect>
        </g>
    </svg>
);


export default function HomePage() {

  return (
    <div className="flex-1">
      <section className="container grid lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-headline">
            Understand Your Oral Health with <span className="text-primary">Mouth Metrics</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            A unified dental app for tracking, analyzing, and improving your oral hygiene. Secure, simple, and intelligent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-80 lg:h-[450px] w-full flex items-center justify-center">
            <HeroSvg className="w-full h-full" />
        </div>
      </section>
    </div>
  );
}
