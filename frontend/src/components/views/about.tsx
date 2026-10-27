"use client";

import { Sparkles, Target, Eye, Heart, ShieldCheck, Users2 } from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const values = [
  {
    icon: Target,
    title: "Practical over impressive",
    description:
      "Every feature has to do real work for real planners. No vanity metrics, no decorative dashboards, no features that look good in screenshots but never get used.",
  },
  {
    icon: Eye,
    title: "Calm by design",
    description:
      "Planning a celebration is stressful enough. UtsavAI stays quiet, organized, and clear. Subtle motion, restrained color, plenty of whitespace.",
  },
  {
    icon: Heart,
    title: "Every celebration, equally",
    description:
      "The same interface works for a 220-person wedding and a 12-person family dinner. No wedding-only assumptions, no birthday-only shortcuts.",
  },
  {
    icon: ShieldCheck,
    title: "Honest about AI",
    description:
      "AI-generated content is always marked. No fake social proof, no invented testimonials, no inflated metrics. If we do not have proof, we leave it out.",
  },
  {
    icon: Users2,
    title: "Made for India, useful anywhere",
    description:
      "INR currency, Indian event categories, realistic local examples. The planning workflow itself works for any celebration, anywhere.",
  },
  {
    icon: Sparkles,
    title: "Intelligence in service of plans",
    description:
      "AI is a tool inside the workspace, not a separate product. It drafts plans, surfaces risks, answers questions, and gets out of the way.",
  },
];

export function AboutView() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1">
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              About UtsavAI
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight font-display text-foreground leading-tight">
              A planning workspace for every celebration.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              UtsavAI is built on a simple idea: planning a celebration should
              feel organized, not overwhelming. Whether it is a 200-person
              wedding or a 12-person birthday, the same workspace brings budget,
              tasks, timeline, vendors, guests, and AI recommendations together.
            </p>
          </div>
        </section>

        <section className="border-b border-border py-16 sm:py-20 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-10">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                What we value
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display text-foreground">
                Principles behind the product
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v) => (
                <Card key={v.title} className="p-6 gap-0">
                  <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <v.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold font-display text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight font-display text-foreground">
              Built to be connected, not locked in.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              This is a frontend showcase with realistic demo data. The product
              is designed to connect to a Next.js backend, a database such as
              Supabase, and an AI API. No vendor lock-in. Your data stays yours.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate({ kind: "public", view: "register" })}
              >
                Start Planning
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ kind: "public", view: "features" })}
              >
                See Features
              </Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
