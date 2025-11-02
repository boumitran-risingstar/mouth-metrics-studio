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
            d="M 125,100 C 50,125 50,220 100,275 C 100,350 150,425 250,425 C 350,425 400,350 400,275 C 450,220 450,125 375,100 C 325,50 175,50 125,100 Z"
        />
        </g>
        
        {/* Decorative Shapes */}
        <g opacity="0.7">
             <circle cx="90" cy="150" r="10" fill="hsl(var(--primary-foreground))" opacity="0.6">
                 <animate attributeName="cy" from="170" to="150" dur="1.5s" repeatCount="indefinite" direction="alternate" />
            </circle>
            <rect x="400" y="200" width="20" height="20" rx="5" fill="hsl(var(--primary-foreground))" opacity="0.7">
                <animateTransform attributeName="transform" type="rotate" from="0 410 210" to="360 410 210" dur="5s" repeatCount="indefinite" />
            </rect>
             <circle cx="380" cy="350" r="8" fill="hsl(var(--primary-foreground))" opacity="0.5">
                <animate attributeName="cx" from="370" to="390" dur="2s" repeatCount="indefinite" direction="alternate" />
            </circle>
            <circle cx="120" cy="380" r="12" fill="hsl(var(--primary-foreground))" opacity="0.4">
                <animate attributeName="r" from="10" to="14" dur="3s" repeatCount="indefinite" direction="alternate" />
            </circle>
            <rect x="350" y="380" width="15" height="15" rx="4" fill="hsl(var(--primary-foreground))" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" from="0 357.5 387.5" to="360 357.5 387.5" dur="6s" repeatCount="indefinite" />
            </rect>

            <circle cx="100" cy="80" r="5" fill="hsl(var(--primary-foreground))" opacity="0.8">
                 <animate attributeName="cy" from="80" to="90" dur="2.5s" repeatCount="indefinite" direction="alternate" />
            </circle>
             <circle cx="430" cy="280" r="7" fill="hsl(var(--primary-foreground))" opacity="0.7">
                <animate attributeName="r" from="5" to="9" dur="2.2s" repeatCount="indefinite" direction="alternate" />
            </circle>
            <rect x="70" y="280" width="10" height="10" rx="3" fill="hsl(var(--primary-foreground))" opacity="0.5">
                <animateTransform attributeName="transform" type="rotate" from="0 75 285" to="360 75 285" dur="7s" repeatCount="indefinite" />
            </rect>
            <circle cx="250" cy="80" r="6" fill="hsl(var(--primary-foreground))" opacity="0.9">
                 <animate attributeName="cx" from="240" to="260" dur="2.8s" repeatCount="indefinite" direction="alternate" />
            </circle>
            <rect x="420" y="120" width="18" height="18" rx="4" fill="hsl(var(--primary-foreground))" opacity="0.4">
                <animate attributeName="y" from="110" to="130" dur="3.5s" repeatCount="indefinite" direction="alternate" />
            </rect>
             <circle cx="300" cy="400" r="9" fill="hsl(var(--primary-foreground))" opacity="0.6">
                <animate attributeName="cy" from="390" to="410" dur="1.8s" repeatCount="indefinite" direction="alternate" />
            </circle>
             <rect x="150" y="100" width="12" height="12" rx="3" fill="hsl(var(--primary-foreground))" opacity="0.5">
                <animateTransform attributeName="transform" type="rotate" from="360 156 106" to="0 156 106" dur="5.5s" repeatCount="indefinite" />
            </rect>
             <circle cx="400" cy="90" r="8" fill="hsl(var(--primary-foreground))" opacity="0.7">
                <animate attributeName="r" from="6" to="10" dur="3.2s" repeatCount="indefinite" direction="alternate" />
            </circle>
             <circle cx="80" cy="350" r="6" fill="hsl(var(--primary-foreground))" opacity="0.6">
                <animate attributeName="cx" from="75" to="85" dur="2.1s" repeatCount="indefinite" direction="alternate" />
            </circle>

            {/* Added sprinkler animations */}
            <circle cx="250" cy="250" r="4" fill="hsl(var(--primary-foreground))" opacity="0.8">
                 <animate attributeName="r" from="2" to="5" dur="2s" repeatCount="indefinite" direction="alternate" />
                 <animate attributeName="cx" from="245" to="255" dur="2.5s" repeatCount="indefinite" direction="alternate" />
            </circle>
             <rect x="280" y="220" width="8" height="8" rx="2" fill="hsl(var(--primary-foreground))" opacity="0.7">
                <animateTransform attributeName="transform" type="rotate" from="0 284 224" to="360 284 224" dur="4s" repeatCount="indefinite" />
            </rect>
            <circle cx="220" cy="280" r="5" fill="hsl(var(--primary-foreground))" opacity="0.6">
                <animate attributeName="cy" from="275" to="285" dur="1.5s" repeatCount="indefinite" direction="alternate" />
            </circle>
            <rect x="200" y="200" width="10" height="10" rx="3" fill="hsl(var(--primary-foreground))" opacity="0.5">
                <animate attributeName="y" from="195" to="205" dur="3s" repeatCount="indefinite" direction="alternate" />
                 <animateTransform attributeName="transform" type="rotate" from="0 205 205" to="180 205 205" dur="5s" repeatCount="indefinite" direction="alternate" />
            </rect>
             <circle cx="300" cy="290" r="6" fill="hsl(var(--primary-foreground))" opacity="0.9">
                 <animate attributeName="r" from="4" to="7" dur="2.5s" repeatCount="indefinite" direction="alternate" />
            </circle>
            <circle cx="180" cy="310" r="3" fill="hsl(var(--primary-foreground))" opacity="0.7">
                 <animate attributeName="cx" from="178" to="182" dur="1.2s" repeatCount="indefinite" direction="alternate" />
            </circle>
            <rect x="320" y="250" width="7" height="7" rx="2" fill="hsl(var(--primary-foreground))" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" from="360 323.5 253.5" to="0 323.5 253.5" dur="6s" repeatCount="indefinite" />
            </rect>

        </g>

        {/* Bar Chart Elements */}
        <g opacity="0.8" transform="translate(100, 180) scale(0.6)">
            <rect x="50" y="250" width="30" height="0" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.5">
                 <animate id="draw1" attributeName="height" from="0" to="50" dur="0.3s" begin="0s;erase7.end" fill="freeze" />
                 <animate attributeName="y" from="250" to="200" dur="0.3s" begin="0s;erase7.end" fill="freeze" />
                 <animate id="erase1" attributeName="height" from="50" to="0" dur="0.3s" begin="draw7.end+2s" fill="freeze" />
                 <animate attributeName="y" from="200" to="250" dur="0.3s" begin="draw7.end+2s" fill="freeze" />
            </rect>
            <rect x="90" y="250" width="30" height="0" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.6">
                 <animate id="draw2" attributeName="height" from="0" to="80" dur="0.3s" begin="draw1.end" fill="freeze" />
                 <animate attributeName="y" from="250" to="170" dur="0.3s" begin="draw1.end" fill="freeze" />
                 <animate id="erase2" attributeName="height" from="80" to="0" dur="0.3s" begin="erase1.end" fill="freeze" />
                 <animate attributeName="y" from="170" to="250" dur="0.3s" begin="erase1.end" fill="freeze" />
            </rect>
            <rect x="130" y="250" width="30" height="0" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.7">
                 <animate id="draw3" attributeName="height" from="0" to="110" dur="0.3s" begin="draw2.end" fill="freeze" />
                 <animate attributeName="y" from="250" to="140" dur="0.3s" begin="draw2.end" fill="freeze" />
                 <animate id="erase3" attributeName="height" from="110" to="0" dur="0.3s" begin="erase2.end" fill="freeze" />
                 <animate attributeName="y" from="140" to="250" dur="0.3s" begin="erase2.end" fill="freeze" />
            </rect>
            <rect x="170" y="250" width="30" height="0" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.75">
                <animate id="draw4" attributeName="height" from="0" to="140" dur="0.3s" begin="draw3.end" fill="freeze" />
                <animate attributeName="y" from="250" to="110" dur="0.3s" begin="draw3.end" fill="freeze" />
                <animate id="erase4" attributeName="height" from="140" to="0" dur="0.3s" begin="erase3.end" fill="freeze" />
                <animate attributeName="y" from="110" to="250" dur="0.3s" begin="erase3.end" fill="freeze" />
            </rect>
            <rect x="210" y="250" width="30" height="0" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.8">
                 <animate id="draw5" attributeName="height" from="0" to="170" dur="0.3s" begin="draw4.end" fill="freeze" />
                 <animate attributeName="y" from="250" to="80" dur="0.3s" begin="draw4.end" fill="freeze" />
                 <animate id="erase5" attributeName="height" from="170" to="0" dur="0.3s" begin="erase4.end" fill="freeze" />
                 <animate attributeName="y" from="80" to="250" dur="0.3s" begin="erase4.end" fill="freeze" />
            </rect>
            <rect x="250" y="250" width="30" height="0" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="0.9">
                 <animate id="draw6" attributeName="height" from="0" to="190" dur="0.3s" begin="draw5.end" fill="freeze" />
                 <animate attributeName="y" from="250" to="60" dur="0.3s" begin="draw5.end" fill="freeze" />
                 <animate id="erase6" attributeName="height" from="190" to="0" dur="0.3s" begin="erase5.end" fill="freeze" />
                 <animate attributeName="y" from="60" to="250" dur="0.3s" begin="erase5.end" fill="freeze" />
            </rect>
            <rect x="290" y="250" width="30" height="0" fill="hsl(var(--primary-foreground))" rx="5" ry="5" opacity="1.0">
                 <animate id="draw7" attributeName="height" from="0" to="210" dur="0.3s" begin="draw6.end" fill="freeze" />
                 <animate attributeName="y" from="250" to="40" dur="0.3s" begin="draw6.end" fill="freeze" />
                 <animate id="erase7" attributeName="height" from="210" to="0" dur="0.3s" begin="erase6.end" fill="freeze" />
                 <animate attributeName="y" from="40" to="250" dur="0.3s" begin="erase6.end" fill="freeze" />
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
