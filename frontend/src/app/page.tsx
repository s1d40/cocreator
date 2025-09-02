import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { ArrowRight, Bot, Code, PenTool, Rocket, Target, BrainCircuit, Briefcase, Users } from 'lucide-react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-conic-gradient opacity-20" />
          <div className="container px-4 md:px-6 relative text-center">
            <div className="flex flex-col justify-center space-y-4 animate-fade-in-up">
              <h1 className="inline-block text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                SFAI Solutions: Engineering the Next Wave of AI Innovation
              </h1>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                We build intelligent, enterprise-ready AI solutions that bridge the gap between complex technology and real-world business impact.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg" className="group">
                  <Link href="#mission">
                    Explore Our Vision <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Vision Section */}
        <section id="mission" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Mission & Vision</h2>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Mission</h3>
                </div>
                <p className="text-muted-foreground">
                  To become the industry's most trusted reference for delivering intelligent, reliable, and impactful AI solutions.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Vision</h3>
                </div>
                <p className="text-muted-foreground">
                  We envision a future where AI is a seamless and powerful extension of every business, driving creativity, efficiency, and growth. Our goal is to build the foundational tools and platforms that make this future a reality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Solutions Section */}
        <section id="solutions" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Solutions</h2>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2">
              <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PenTool /> Cocreator</CardTitle>
                  <CardDescription>Intelligent Content for Social Media</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Our flagship application that empowers creators and marketers to generate high-quality, engaging video content. By leveraging generative AI, Cocreator streamlines the entire creative workflow, from ideation to final production.</p>
                  <Button asChild variant="outline">
                    <Link href="/cocreator">
                      Coming Soon <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Briefcase /> Custom AI Solutions</CardTitle>
                  <CardDescription>Solving Your Company's Unique Challenges</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We partner with you to design and build custom AI solutions tailored to solve your company's unique challenges, helping you integrate and deploy AI securely and at scale.</p>
                  <Button asChild variant="outline">
                    <Link href="/contact">
                      Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Commitment Section */}
        <section id="commitment" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Commitment to Excellence</h2>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-3 lg:gap-12">
              <div className="text-center space-y-2">
                <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                  <Code className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">Technical Rigor</h3>
                <p className="text-muted-foreground">We are founded on principles of engineering excellence, building robust, scalable, and secure AI systems.</p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">User-Centric Design</h3>
                <p className="text-muted-foreground">We believe the most powerful technology is intuitive. Our products are designed with the end-user at the core.</p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                  <BrainCircuit className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">Future-Focused Innovation</h3>
                <p className="text-muted-foreground">We are constantly exploring the cutting edge of AI to deliver solutions that are not just current, but are built for the future.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Let's Build the Future Together</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl mb-8">
              We are actively seeking partners and investors who share our vision. If you're interested in learning more about SFAI Solutions, our products, or our roadmap, please get in touch.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 SFAI Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}
