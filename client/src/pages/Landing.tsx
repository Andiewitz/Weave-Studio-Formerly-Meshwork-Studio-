import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-serif">W</span>
            </div>
            <span className="text-xl font-bold font-serif">Weaving Studio</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="/api/login">Sign In</a>
            </Button>
            <Button asChild className="rounded-full px-6">
              <a href="/api/login">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              Now in Public Beta v2.0
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Organize your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">digital chaos.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Weaving Studio provides a unified workspace for your teams, projects, and ideas.
              Stop switching apps and start focusing on what matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg" asChild>
                <a href="/auth">
                  Start for Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg">
                View Demo
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                14-day free trial
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          {/* Abstract Hero Image/Graphic */}
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/20 bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Simple dashboard representation */}
            <div className="absolute inset-4 rounded-xl bg-background/10 backdrop-blur-md border border-white/10 p-6 flex flex-col gap-4">
              <div className="h-8 w-1/3 bg-white/10 rounded-full mb-4" />
              <div className="flex gap-4 mb-4">
                <div className="h-32 w-full bg-primary/20 rounded-2xl border border-primary/30" />
                <div className="h-32 w-full bg-blue-500/20 rounded-2xl border border-blue-500/30" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 w-full bg-white/5 rounded-xl border border-white/5 flex items-center px-4 gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10" />
                    <div className="flex-1">
                      <div className="h-3 w-1/2 bg-white/20 rounded-full mb-2" />
                      <div className="h-2 w-1/4 bg-white/10 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-10 right-10 p-4 bg-white rounded-2xl shadow-xl flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Task Completed</p>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </motion.div>
          </div>

          {/* Background Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary to-blue-600 opacity-20 blur-3xl -z-10 rounded-full" />
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-8">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos represented as text for simplicity, replace with SVGs in real app */}
            {["Acme Corp", "GlobalTech", "Nebula", "FocusGroup", "Circle"].map((brand) => (
              <span key={brand} className="text-xl font-bold">{brand}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
