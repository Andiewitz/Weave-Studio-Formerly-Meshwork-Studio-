import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function AuthPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
            {/* Left Panel - Hero/Brand */}
            <div className="hidden lg:flex flex-col justify-between p-8 bg-black text-white relative overflow-hidden border-r border-white/5">
                {/* Background content */}

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                        <span className="text-black font-bold font-serif text-xl">W</span>
                    </div>
                    <span className="text-2xl font-bold font-serif tracking-tight">Weaving Studio</span>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7 }}
                        className="w-full max-w-2xl px-8"
                    >
                        <img
                            src="/auth-hero.png"
                            alt="Workspace Dashboard"
                            className="w-full h-auto object-contain"
                        />
                    </motion.div>

                    <div className="mt-8 text-center max-w-md">
                        <h2 className="text-3xl font-bold mb-4 tracking-tight">
                            Your digital HQ, reimagined.
                        </h2>
                        <p className="text-zinc-500 text-lg leading-relaxed">
                            Join thousands of teams using Weaving Studio to streamline workflows and boost productivity.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex justify-between text-sm text-zinc-500">
                    <p>© 2026 Weaving Studio Inc.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex items-center justify-center p-8 bg-background relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">
                            Welcome back
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <Card className="border-2 border-border shadow-xl">
                        <CardContent className="pt-6 space-y-6">
                            {/* Authentication Button */}
                            <div className="space-y-4">
                                <Button
                                    size="lg"
                                    className="w-full h-14 text-lg font-medium rounded-xl group relative overflow-hidden"
                                    asChild
                                >
                                    <a href="/api/login">
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            Continue to Studio
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        {/* Hover effect */}
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </a>
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">
                                            Public Beta
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground text-center">
                                    <p>
                                        By clicking continue, you agree to our <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
