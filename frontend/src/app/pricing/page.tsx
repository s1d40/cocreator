import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/ month',
    description: 'Get started and explore the basics.',
    features: [
      '2 video generations per month',
      'Watermarked videos',
      'Standard voice options',
      '720p video quality',
    ],
    cta: 'Start for Free',
    href: '/dashboard',
  },
  {
    name: 'Pro',
    price: '$25',
    period: '/ month',
    description: 'For creators who need more power and flexibility.',
    features: [
      '30 video generations per month',
      'No watermarks',
      'Premium voice options',
      '1080p video quality',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    href: '#',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and businesses requiring advanced features.',
    features: [
      'Unlimited video generations',
      'Custom branding options',
      'API access',
      'Dedicated account manager',
      'Team collaboration tools',
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-conic-gradient opacity-20" />
          <div className="container px-4 md:px-6 text-center relative animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="inline-block text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Find the Perfect Plan for You
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Start for free and scale up as you grow. All plans include our core AI video generation features.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full pb-20 md:pb-32">
          <div className="container grid grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-3 lg:gap-12">
            {tiers.map((tier, i) => (
              <Card 
                key={tier.name} 
                className={cn(
                  "flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 animate-fade-in-up",
                  tier.popular ? 'border-primary shadow-lg ring-2 ring-primary' : 'border-border'
                )}
                style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  <ul className="mt-6 space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
