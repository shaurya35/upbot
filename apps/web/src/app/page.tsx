"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Head from 'next/head';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Globe,
  Zap,
  Shield,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Activity,
  Smartphone,
  Mail,
  MessageSquare,
  TrendingUp,
  Twitter,
  Github,
  ExternalLink,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadWaitlistCount = async () => {
      setIsLoadingCount(true);
      try {
        const res = await fetch("/api/waitlist", {
          cache: "no-cache",
        });
        if (!res.ok) throw new Error("error");
        const json = await res.json();
        setWaitlistCount(json.users);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingCount(false);
      }
    };
    loadWaitlistCount();
  }, []);

  const handleWaitlistSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setWaitlistCount((prev) => (prev === null ? 1 : prev + 1));
      } else {
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <>
    <Head>
    <link rel="canonical" href="https://upbot.com/" />
  </Head>
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header - More Compact Mobile */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-600">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                Upbot
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              {/* <Link
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Features
              </Link> */}
              {/* <Link
                href="#pricing"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </Link> */}
              {/* <Link
                href="#about"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                About
              </Link> */}
              {/* <Button
                size="sm"
                className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 cursor-pointer"
              >
                Sign In
              </Button> */}
              <Link href="#">
                {" "}
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {/* Get Started */}
                  Join Waitlist
                </Button>
              </Link>
            </nav>
            <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0">
              <Activity className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Cleaner Mobile Layout */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184_/_0.15)_1px,transparent_0)] [background-size:24px_24px]" />

          <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative py-8 sm:py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-5xl text-center">
              <Badge
                variant="secondary"
                className="mb-4 sm:mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1.5 text-xs sm:text-sm"
              >
                {/* Trusted by fast-growing companies worldwide */}
                Trusted by fast-growing community worldwide
              </Badge>

              {/* Cleaner 2-row heading */}
              <h1 className="mb-4 sm:mb-8 text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-slate-900 leading-none">
                The most comprehensive
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Uptime Monitoring Platform
                </span>
              </h1>

              <p className="mx-auto mb-6 sm:mb-12 max-w-2xl text-sm sm:text-lg md:text-xl text-slate-600 leading-normal px-1 sm:px-4 lg:px-0">
                Monitor your websites from 7+ global locations with instant
                alerts, detailed analytics, and comprehensive downtime
                reporting.
              </p>

              {/* Smaller, Cleaner Waitlist Form */}
              <div className="mb-6 sm:mb-12 px-3 sm:px-0">
                <form
                  onSubmit={handleWaitlistSubmit}
                  className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center max-w-lg mx-auto"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base font-semibold border-slate-300 focus:border-emerald-500 focus:ring-emerald-200 bg-white text-black"
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 sm:px-6 h-10 sm:h-11 whitespace-nowrap text-sm sm:text-base"
                    disabled={isSubmitted || isSubmitting}
                  >
                    {isSubmitted
                      ? "Added!"
                      : isSubmitting
                        ? "Joining..."
                        : "Join Waitlist"}
                    <ArrowRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </form>

                {/* Waitlist Counter with Better Skeleton */}
                <div className="mt-4 sm:mt-6 flex items-center justify-center space-x-2">
                  {isLoadingCount ? (
                    <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      <span>
                        <Skeleton className="h-2.5 w-8 bg-slate-300 inline-block align-baseline" />{" "}
                        developers already joined
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      <span>
                        <span className="font-semibold text-emerald-600">
                          {waitlistCount !== null
                            ? waitlistCount.toLocaleString()
                            : "0"}
                        </span>{" "}
                        developers already joined
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3">
                  🚀 Currently in development. Be the first to know when we
                  launch!
                </p>
              </div>

              {/* Cleaner Trust Indicators */}
              <div className="text-center px-3 sm:px-0">
                <p className="text-xs text-slate-500 mb-3 sm:mb-6">
                  {/* Trusted by fast-growing companies */}
                  Backed by a growing dev community
                </p>
                <div className="flex items-center justify-center space-x-4 sm:space-x-8 opacity-60">
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-slate-400">
                    vercel
                  </div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-slate-400">
                    stripe
                  </div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-slate-400">
                    github
                  </div>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold text-slate-400">
                    linear
                  </div>
                  <div className="hidden sm:block text-sm sm:text-lg md:text-2xl font-bold text-slate-400">
                    notion
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - More Compact Mobile */}
        <section className="py-12 sm:py-20 md:py-24 bg-slate-50/50">
          <div className="container mx-auto px-3 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-16 md:mb-20">
              <Badge
                variant="secondary"
                className="mb-2 sm:mb-4 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
              >
                Upbot Components
              </Badge>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-6 px-1 sm:px-4 lg:px-0">
                Pixel-perfect monitoring,
                <br />
                deployed in minutes
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-1 sm:px-4 lg:px-0 leading-relaxed">
                Everything you need to monitor your applications with
                enterprise-grade reliability.
              </p>
            </div>

            {/* Main Feature Grid - Cleaner Mobile */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 items-center mb-8 sm:mb-16 md:mb-20 max-w-7xl mx-auto">
              <div className="px-1 sm:px-4 lg:px-0 text-center lg:text-left">
                <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-3 sm:mb-6">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Global Infrastructure
                </div>
                <h3 className="text-xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-4">
                  Monitor from everywhere,
                  <br />
                  see everything
                </h3>
                <p className="text-sm sm:text-lg text-slate-600 mb-4 sm:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Our global network ensures accurate uptime data from every
                  corner of the world.
                </p>
                <div className="space-y-2 sm:space-y-4 text-left max-w-md mx-auto lg:mx-0">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-xs sm:text-base text-slate-700">
                      7+ global monitoring locations
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-xs sm:text-base text-slate-700">
                      30-second check intervals
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-xs sm:text-base text-slate-700">
                      99.9% monitoring uptime SLA
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative px-1 sm:px-4 lg:px-0">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-3 sm:p-6 md:p-8 border mx-auto max-w-sm lg:max-w-none">
                  <div className="flex items-center justify-between mb-3 sm:mb-6">
                    <h4 className="font-semibold text-slate-900 text-xs sm:text-base">
                      Global Status
                    </h4>
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      All Systems Operational
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-4">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs sm:text-sm font-medium text-black">
                          North America
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600">
                        142ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs sm:text-sm font-medium text-black">
                          Europe
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600">
                        89ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs sm:text-sm font-medium text-black">
                          Asia Pacific
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600">
                        203ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Features - More Compact */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-1 sm:px-4 lg:px-0">
              <div className="text-center">
                <div className="w-8 sm:w-12 h-8 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <Zap className="w-4 sm:w-6 h-4 sm:h-6 text-emerald-600" />
                </div>
                <h4 className="text-sm sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">
                  Instant Notifications
                </h4>
                <p className="text-xs sm:text-base text-slate-600 max-w-xs mx-auto">
                  Get alerted via email, SMS, Slack, or webhooks the moment
                  something goes wrong.
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 sm:w-12 h-8 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <BarChart3 className="w-4 sm:w-6 h-4 sm:h-6 text-emerald-600" />
                </div>
                <h4 className="text-sm sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">
                  Advanced Analytics
                </h4>
                <p className="text-xs sm:text-base text-slate-600 max-w-xs mx-auto">
                  Detailed reports with uptime trends, performance metrics, and
                  historical data.
                </p>
              </div>
              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="w-8 sm:w-12 h-8 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <Shield className="w-4 sm:w-6 h-4 sm:h-6 text-emerald-600" />
                </div>
                <h4 className="text-sm sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">
                  SSL Monitoring
                </h4>
                <p className="text-xs sm:text-base text-slate-600 max-w-xs mx-auto">
                  Monitor certificate expiration and security issues before they
                  impact users.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Section - Cleaner Mobile */}
        <section className="py-12 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-3 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 items-center">
              <div className="relative order-2 lg:order-1 px-1 sm:px-4 lg:px-0">
                <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 border mx-auto max-w-sm lg:max-w-xl">
                  <div className="mb-2 sm:mb-3">
                    <h4 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-xs sm:text-base">
                      Notification Channels
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="flex items-center p-2 bg-white rounded-lg border">
                        <Mail className="w-3 sm:w-5 h-3 sm:h-5 text-slate-600 mr-1.5 sm:mr-3" />
                        <span className="text-xs sm:text-sm font-medium text-black">
                          Email
                        </span>
                      </div>
                      <div className="flex items-center p-2 bg-white rounded-lg border">
                        <Smartphone className="w-3 sm:w-5 h-3 sm:h-5 text-slate-600 mr-1.5 sm:mr-3" />
                        <span className="text-xs sm:text-sm font-medium text-black">
                          SMS
                        </span>
                      </div>
                      <div className="flex items-center p-2 bg-white rounded-lg border">
                        <MessageSquare className="w-3 sm:w-5 h-3 sm:h-5 text-slate-600 mr-1.5 sm:mr-3" />
                        <span className="text-xs sm:text-sm font-medium text-black">
                          Slack
                        </span>
                      </div>
                      <div className="flex items-center p-2 bg-white rounded-lg border">
                        <Activity className="w-3 sm:w-5 h-3 sm:h-5 text-slate-600 mr-1.5 sm:mr-3" />
                        <span className="text-xs sm:text-sm font-medium text-black">
                          Webhook
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 px-1 sm:px-4 lg:px-0 text-center lg:text-left">
                <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-2 sm:mb-3">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Integrations
                </div>
                <h3 className="text-xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
                  Connect with your
                  <br />
                  existing workflow
                </h3>
                <p className="text-sm sm:text-lg text-slate-600 mb-3 sm:mb-4 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Seamlessly integrate with your favorite tools and get notified
                  exactly where you want.
                </p>
                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-sm">
                  {/* View all integrations */}
                  <Link href="#">Join Waitlist</Link>
                  <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Stories - Cleaner Mobile */}
        <section className="py-12 sm:py-20 md:py-24 bg-slate-50/50">
          <div className="container max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-16">
              <Badge
                variant="secondary"
                className="mb-2 sm:mb-4 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
              >
                {/* Customer Stories */}
                Why Builders Are Joining
              </Badge>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-6 px-1 sm:px-4 lg:px-0">
                {/* Trusted by industry leaders */}
                Built for Fast‑Moving Teams
              </h2>
              <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto px-1 sm:px-4 lg:px-0 leading-relaxed">
                {/* See how teams worldwide rely on Upbot to maintain 99.9% uptime */}
                Join the early adopters shaping the future of uptime monitoring
              </p>
            </div>

            {/* Stats Row - More Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8 mb-8 sm:mb-16 px-1 sm:px-4 lg:px-0">
              <div className="text-center">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold text-emerald-600 mb-1">
                  50K+
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  {/* Websites Monitored */}
                  Zero-Config Monitoring
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold text-emerald-600 mb-1">
                  99.9%
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  {/* Average Uptime */}
                  Always-On Reliability
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold text-emerald-600 mb-1">
                  2.3s
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  Alert Response
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold text-emerald-600 mb-1">
                  7+
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  Global Locations
                </div>
              </div>
            </div>

            {/* Testimonials Grid - More Compact */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-1 sm:px-4 lg:px-0 ">
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-4 sm:p-8">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-2 sm:ml-3 bg-emerald-50 text-emerald-700 text-xs"
                    >
                      {/* Verified */}
                      From the Dev Team
                    </Badge>
                  </div>
                  <p className="text-slate-700 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-base">
                    {/* &quot;Upbot detected our API outage 3 minutes before our
                    users started complaining. The Slack integration saved us
                    from a major incident.&quot; */}
                    &quot;Set up in under 30 seconds and it just works. Finally,
                    monitoring that doesn’t get in the way—only alerts when it
                    matters.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 mr-3 sm:mr-4 flex items-center justify-center text-white font-semibold text-xs sm:text-base">
                      {/* SC */}
                      DT
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs sm:text-base">
                        {/* Sarah Chen */}
                        Dev Tester
                      </div>
                      <div className="text-xs text-slate-500">
                        {/* CTO, TechFlow */}
                        Internal QA, Upbot
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-4 sm:p-8">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-2 sm:ml-3 bg-emerald-50 text-emerald-700 text-xs"
                    >
                      {/* Verified */}
                      Early Community
                    </Badge>
                  </div>
                  <p className="text-slate-700 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-base">
                    {/* &quot;The global monitoring gives us confidence that our
                    users worldwide have great experiences. Setup took literally
                    30 seconds.&quot; */}
                    &quot;The interface is so clean and intuitive, I felt
                    confident shipping it right away. No more alert fatigue—just
                    actionable notifications.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 mr-3 sm:mr-4 flex items-center justify-center text-white font-semibold text-xs sm:text-base">
                      {/* MR */}
                      SR
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs sm:text-base">
                        {/* Mike Rodriguez */}
                        Siddharth
                      </div>
                      <div className="text-xs text-slate-500">
                        {/* DevOps Lead, ScaleUp */}
                        Community Member
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300 md:col-span-2 lg:col-span-1">
                <CardContent className="p-4 sm:p-8">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-2 sm:ml-3 bg-emerald-50 text-emerald-700 text-xs"
                    >
                      {/* Verified */}
                      Design Preview
                    </Badge>
                  </div>
                  <p className="text-slate-700 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-base">
                    {/* &quot;Beautiful interface, powerful features, and rock-solid
                    reliability. Upbot is exactly what our monitoring stack
                    needed to scale.&quot; */}
                    &quot;Sleek, powerful, and exactly what we needed to ensure
                    24/7 uptime. Feels like a modern status page built by devs,
                    for devs.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 mr-3 sm:mr-4 flex items-center justify-center text-white font-semibold text-xs sm:text-base">
                      AT
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs sm:text-base">
                        Sahil Lenka
                      </div>
                      <div className="text-xs text-slate-500">
                        {/* Founder, BuildFast */}
                        Community Member
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section - Cleaner Mobile */}
        {/* <section className="relative py-12 sm:py-20 md:py-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 overflow-hidden"> */}
        <section className="relative py-12 sm:py-20 md:py-24 bg-emerald-700 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:32px_32px]" />

          <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-xs font-medium mb-4 sm:mb-8">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                {/* Join 10,000+ developers monitoring with Upbot */}
                Be one of the first to grab free monitoring with Upbot
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-6 px-1 sm:px-4 lg:px-0">
                Start monitoring in
                <span className="text-emerald-200"> 30 seconds</span>
              </h2>

              <p className="text-base sm:text-xl text-emerald-100 mb-6 sm:mb-10 leading-relaxed max-w-2xl mx-auto px-1 sm:px-4 lg:px-0">
                {/* No credit card required. No setup fees. Start with our free tier
                and scale as you grow. */}
                Always free for hobbyists, no card, no catch
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-12 px-1 sm:px-4 lg:px-0">
                <div className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold w-full sm:w-auto"
                  >
                    <Link href="#">Join Waitlist</Link>
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-emerald-400/30 text-emerald-100 hover:bg-emerald-600 bg-transparent px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold w-full sm:w-auto"
                >
                  <a href="https://twitter.com/_shaurya35" target="_blank">
                    Contact Us
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-8 text-emerald-200 text-xs sm:text-sm max-w-2xl mx-auto px-1 sm:px-4 lg:px-0">
                <div className="flex items-center justify-center sm:justify-start">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-300" />
                  {/* 14-day free trial */}
                  Forever‑free tier
                </div>
                <div className="flex items-center justify-center sm:justify-start">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-300" />
                  {/* No credit card required */}
                  No payment details needed
                </div>
                <div className="flex items-center justify-center sm:justify-start">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-300" />
                  {/* Cancel anytime */}
                  Opt out anytime
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - More Compact Mobile */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-3 sm:px-6 lg:px-36 py-8 sm:py-16">
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-5">
            <div className="sm:col-span-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3 sm:mb-6">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-slate-900">
                  Upbot
                </span>
              </div>
              <p className="text-slate-600 mb-3 sm:mb-6 max-w-md text-xs sm:text-base mx-auto sm:mx-0">
                The most comprehensive uptime monitoring platform for modern
                applications. Monitor, alert, and analyze with enterprise-grade
                reliability.
              </p>
              {/* Social Icons */}
              <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
                <Link
                  href="https://twitter.com/_shaurya35"
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                  target="_blank"
                >
                  <Twitter className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                </Link>
                <Link
                  href="https://github.com/shaurya35/"
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Github"
                  target="_blank"
                >
                  <Github className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                </Link>
                <Link
                  href="https://www.shauryacodes.me/"
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="External Link"
                  target="_blank"
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                </Link>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-slate-900 mb-2 sm:mb-4 text-sm">
                Product
              </h3>
              <ul className="space-y-1 sm:space-y-3 text-slate-600 text-xs sm:text-base">
                <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    {/* Features */}
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    {/* Pricing */}
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    {/* API */}
                    Join Waitlist
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Status Page
                  </Link>
                </li> */}
                {/* <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Integrations
                  </Link>
                </li> */}
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-slate-900 mb-2 sm:mb-4 text-sm">
                Company
              </h3>
              <ul className="space-y-1 sm:space-y-3 text-slate-600 text-xs sm:text-base">
                <li>
                  <Link
                    href="https://x.com/_shaurya35"
                    target="_blank"
                    className="hover:text-slate-900 transition-colors"
                  >
                    About
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Press
                  </Link>
                </li> */}
                <li>
                  <Link
                    href="https://x.com/_shaurya35"
                    className="hover:text-slate-900 transition-colors"
                    target="_blank"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-slate-900 mb-2 sm:mb-4 text-sm">
                Resources
              </h3>
              <ul className="space-y-1 sm:space-y-3 text-slate-600 text-xs sm:text-base">
                {/* <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Documentation
                  </Link>
                </li> */}
                <li>
                  <Link
                    href="https://x.com/_shaurya35"
                    className="hover:text-slate-900 transition-colors"
                    target="_blank"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://x.com/_shaurya35"
                    className="hover:text-slate-900 transition-colors"
                    target="_blank"
                  >
                    Community
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Privacy Policy 
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li> */}
              </ul>
            </div>
          </div>
          <div className="border-t mt-6 sm:mt-12 pt-4 sm:pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-500 text-xs mb-3 sm:mb-0">
              &copy; {new Date().getFullYear()} Upbot. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-xs text-slate-500">
                Built for hobbyists and startups worldwide
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
