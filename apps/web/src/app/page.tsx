"use client";

import React, { useState, useEffect, FormEvent, useRef } from "react";
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
  Menu,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [statusBoxVisible, setStatusBoxVisible] = useState(false);
  const [animatedLatencies, setAnimatedLatencies] = useState<Record<string, number>>({});
  const [rowAnimated, setRowAnimated] = useState<Record<string, boolean>>({});
  const [heroTextVisible, setHeroTextVisible] = useState(false);

  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const statusBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => {
    const observers = sectionsRef.current.map((section, index) => {
      if (!section) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible((prev) => ({ ...prev, [`section-${index}`]: true }));
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
      );

      observer.observe(section);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroTextVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!statusBoxRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statusBoxVisible) {
            setStatusBoxVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(statusBoxRef.current);
    return () => observer.disconnect();
  }, [statusBoxVisible]);

  useEffect(() => {
    if (!statusBoxVisible) return;

    const regions = [
      { region: "North America", latency: 142 },
      { region: "Europe", latency: 89 },
      { region: "Asia Pacific", latency: 203 },
    ];

    regions.forEach((item, index) => {
      const delay = 600 + index * 150; 
      
      setTimeout(() => {
        const duration = 1000;
        const steps = 30;
        const increment = item.latency / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          current = Math.min(Math.round(increment * step), item.latency);
          setAnimatedLatencies((prev) => ({
            ...prev,
            [item.region]: current,
          }));

          if (step >= steps) {
            clearInterval(timer);
            setRowAnimated((prev) => ({ ...prev, [item.region]: true }));
          }
        }, duration / steps);
      }, delay);
    });
  }, [statusBoxVisible]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError("");
      setEmailValid(false);
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      setEmailValid(false);
      return false;
    }
    setEmailError("");
    setEmailValid(true);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      validateEmail(value);
    } else {
      setEmailError("");
      setEmailValid(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleWaitlistSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

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
        setEmail("");
        setEmailValid(false);
      } else {
        setEmailError("Something went wrong. Please try again.");
      }
    } catch (e) {
      setEmailError("Network error. Please try again.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmailError("");
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-sm"
            : "bg-white/80 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between max-w-7xl mx-auto">
            <Link
              href="/"
              className="flex items-center space-x-2 group"
              aria-label="Upbot Home"
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-600 group-hover:bg-emerald-700 transition-colors duration-200">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Upbot
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={scrollToTop}
              >
                Join Waitlist
              </Button>
            </nav>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-8 w-8 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white animate-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-4 space-y-2">
                <Button
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToTop();
                  }}
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section
          ref={(el) => {
            sectionsRef.current[0] = el;
          }}
          className={`relative overflow-hidden transition-opacity duration-1000 ${
            isVisible["section-0"] ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184_/_0.12)_1px,transparent_0)] [background-size:24px_24px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

          <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative py-16 sm:py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-5xl text-center">
              <Badge
                variant="secondary"
                className="mb-4 sm:mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-emerald-100 transition-colors duration-200"
              >
                Trusted by fast-growing community worldwide
              </Badge>

              <h1 className="mb-4 sm:mb-8 text-fluid-3xl sm:text-fluid-4xl md:text-fluid-5xl lg:text-fluid-6xl font-bold tracking-[-0.02em] text-slate-900 leading-[1.1]">
                <span className="inline-block">
                  {"The most comprehensive".split(" ").map((word, i) => (
                    <span
                      key={i}
                      className="inline-block mr-2"
                      style={{
                        animation: heroTextVisible ? `letter-stagger 0.5s ease-out ${i * 0.1}s both` : "none",
                        opacity: heroTextVisible ? 1 : 0,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
                <br />
                <span className="inline-block text-emerald-600">
                  {"Uptime Monitoring Platform".split(" ").map((word, i) => (
                    <span
                      key={i}
                      className="inline-block mr-2"
                      style={{
                        animation: heroTextVisible 
                          ? `letter-stagger 0.5s ease-out ${0.5 + i * 0.1}s both` 
                          : undefined,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              </h1>

              <p className="mx-auto mb-6 sm:mb-12 max-w-2xl text-fluid-sm sm:text-fluid-base md:text-fluid-lg text-slate-600 leading-[1.6] px-1 sm:px-4 lg:px-0">
                Monitor your websites from 15+ global locations with instant
                alerts, detailed analytics, and comprehensive downtime
                reporting.
              </p>

              <div className="mb-12 sm:mb-12 px-3 sm:px-0">
                <form
                  onSubmit={handleWaitlistSubmit}
                  className="max-w-lg mx-auto"
                  noValidate
                >
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 justify-center items-start sm:items-center">
                    <div className="flex-1 w-full sm:w-auto relative">
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="Enter your email address..."
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={() => validateEmail(email)}
                          className={`flex-1 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base font-medium border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-black transition-all duration-200 w-full ${
                            emailError
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                              : emailValid
                                ? "border-emerald-300"
                                : ""
                          }`}
                          required
                          aria-invalid={!!emailError}
                          aria-describedby={emailError ? "email-error" : undefined}
                        />
                        {emailValid && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 animate-in fade-in duration-200" />
                        )}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 px-4 sm:px-6 h-10 sm:h-11 whitespace-nowrap text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto self-start sm:self-center"
                      disabled={isSubmitted || isSubmitting || !emailValid}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          Joining...
                        </>
                      ) : isSubmitted ? (
                        <>
                          <CheckCircle className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Added!
                        </>
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                 
                  <div className="h-5 mt-1.5 text-center sm:text-left">
                    {emailError && (
                      <p
                        id="email-error"
                        className="text-xs text-red-600 animate-in fade-in duration-200"
                        role="alert"
                      >
                        {emailError}
                      </p>
                    )}
                  </div>
                </form>

                {/* Waitlist Counter */}
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

           
              <div className="text-center px-3 sm:px-0 mt-8 sm:mt-0">
                <p className="text-xs text-slate-500 mb-3 sm:mb-6">
                  Backed by a growing dev community
                </p>
                <div className="flex items-center justify-center space-x-4 sm:space-x-8 opacity-60">
                  {["vercel", "stripe", "github", "linear", "notion"].map(
                    (company, i) => (
                      <div
                        key={company}
                        className={`text-sm sm:text-lg md:text-2xl font-bold text-slate-400 transition-opacity hover:opacity-100 duration-200 ${
                          i === 4 ? "hidden sm:block" : ""
                        }`}
                      >
                        {company}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      
        <section
          ref={(el) => {
            sectionsRef.current[1] = el;
          }}
          className={`py-20 sm:py-20 md:py-24 bg-slate-50/50 transition-opacity duration-1000 delay-150 ${
            isVisible["section-1"] ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="container mx-auto px-3 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <Badge
                variant="secondary"
                className="mb-2 sm:mb-4 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium hover:bg-emerald-100 transition-colors duration-200"
              >
                Upbot Components
              </Badge>
              <h2 className="text-fluid-2xl sm:text-fluid-3xl md:text-fluid-4xl font-bold tracking-[-0.02em] text-slate-900 mb-3 sm:mb-6 px-1 sm:px-4 lg:px-0 leading-[1.1]">
                Pixel-perfect monitoring,
                <br />
                deployed in minutes
              </h2>
              <p className="text-fluid-sm sm:text-fluid-base md:text-fluid-lg text-slate-600 max-w-2xl mx-auto px-1 sm:px-4 lg:px-0 leading-[1.7]">
                Everything you need to monitor your applications with
                enterprise-grade reliability.
              </p>
            </div>

        
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-8 sm:mb-16 md:mb-20 max-w-7xl mx-auto">
              <div className="px-1 sm:px-4 lg:px-0 text-center lg:text-left">
                <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-3 sm:mb-6 hover:bg-emerald-200 transition-colors duration-200">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Global Infrastructure
                </div>
                <h3 className="text-fluid-xl sm:text-fluid-2xl md:text-fluid-3xl font-bold tracking-[-0.02em] text-slate-900 mb-2 sm:mb-4 leading-[1.1]">
                  Monitor from everywhere,
                  <br />
                  see everything
                </h3>
                <p className="text-fluid-sm sm:text-fluid-base md:text-fluid-lg text-slate-600 mb-4 sm:mb-8 leading-[1.7] max-w-lg mx-auto lg:mx-0">
                  Our global network ensures accurate uptime data from every
                  corner of the world.
                </p>
                <div className="space-y-2 sm:space-y-4 text-left max-w-md mx-auto lg:mx-0">
                  {[
                    "15+ global monitoring locations",
                    "30-second check intervals",
                    "99.9% monitoring uptime SLA",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center group">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-2 sm:mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-xs sm:text-base text-slate-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative px-1 sm:px-4 lg:px-0">
                <div
                  ref={statusBoxRef}
                  className={`bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-3 sm:p-6 md:p-8 border border-slate-200/50 mx-auto max-w-sm lg:max-w-none hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-700 hover:-translate-y-1 relative overflow-hidden ${
                    statusBoxVisible
                      ? "opacity-100 translate-x-0 scale-100"
                      : "opacity-0 translate-x-8 scale-95"
                  }`}
                  style={{
                    background: statusBoxVisible
                      ? "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 50%, rgba(236,253,245,0.3) 100%)"
                      : undefined,
                  }}
                >
         
                  <div
                    className={`absolute inset-0 rounded-xl sm:rounded-2xl ${
                      statusBoxVisible
                        ? "bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 animate-[shimmer_3s_ease-in-out_infinite] opacity-0 hover:opacity-100 transition-opacity duration-500"
                        : ""
                    }`}
                    style={{
                      backgroundPosition: statusBoxVisible
                        ? "200% 0"
                        : undefined,
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                      <h4 className="font-semibold text-slate-900 text-xs sm:text-base">
                        Global Status
                      </h4>
                      <Badge
                        className={`bg-green-100 text-green-700 border-green-200 text-xs transition-all duration-500 ${
                          statusBoxVisible
                            ? "opacity-100 scale-100 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                            : "opacity-0 scale-95"
                        }`}
                        style={{
                          transitionDelay: statusBoxVisible ? "300ms" : undefined,
                        }}
                      >
                        <span className="relative">
                          All Systems Operational
                          {statusBoxVisible && (
                            <span className="absolute -inset-1 bg-green-400/30 rounded-full blur-sm animate-pulse" />
                          )}
                        </span>
                      </Badge>
                    </div>
                    <div className="space-y-2 sm:space-y-4">
                      {[
                        { region: "North America", latency: 142 },
                        { region: "Europe", latency: 89 },
                        { region: "Asia Pacific", latency: 203 },
                      ].map((item, index) => {
                        const animatedValue =
                          animatedLatencies[item.region] ?? 0;
                        const isAnimated = rowAnimated[item.region] ?? false;
                        const delay = 600 + index * 150;

                        return (
                          <div
                            key={item.region}
                            className={`flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02] ${
                              statusBoxVisible
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-4"
                            }`}
                            style={{
                              transition: `all 0.5s ease-out ${delay}ms`,
                            }}
                          >
                            <div className="flex items-center">
                              <div className="relative mr-2">
                                <div
                                  className={`w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full ${
                                    statusBoxVisible
                                      ? "animate-[pulse-glow_2s_ease-in-out_infinite]"
                                      : ""
                                  }`}
                                  style={{
                                    boxShadow: statusBoxVisible
                                      ? "0 0 8px rgba(34,197,94,0.8), 0 0 16px rgba(34,197,94,0.4)"
                                      : undefined,
                                  }}
                                />
                                {statusBoxVisible && (
                                  <div
                                    className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-[ripple_2s_ease-out_infinite]"
                                    style={{
                                      animationDelay: `${index * 0.3}s`,
                                    }}
                                  />
                                )}
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-black">
                                {item.region}
                              </span>
                            </div>
                            <span
                              className={`text-xs sm:text-sm text-slate-600 font-mono tabular-nums transition-all duration-200 ${
                                isAnimated
                                  ? "text-emerald-700 font-semibold scale-110"
                                  : ""
                              }`}
                              style={{
                                transition: isAnimated
                                  ? "all 0.2s ease-out"
                                  : undefined,
                              }}
                            >
                              {animatedValue > 0 ? `${animatedValue}ms` : "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

    
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-1 sm:px-4 lg:px-0">
              {[
                {
                  icon: Zap,
                  title: "Instant Notifications",
                  description:
                    "Get alerted via email, SMS, Slack, or webhooks the moment something goes wrong.",
                },
                {
                  icon: BarChart3,
                  title: "Advanced Analytics",
                  description:
                    "Detailed reports with uptime trends, performance metrics, and historical data.",
                },
                {
                  icon: Shield,
                  title: "SSL Monitoring",
                  description:
                    "Monitor certificate expiration and security issues before they impact users.",
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className={`text-center group hover:-translate-y-1 transition-all duration-300 ${
                    index === 2 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="w-8 sm:w-12 h-8 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:bg-emerald-200 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-4 sm:w-6 h-4 sm:h-6 text-emerald-600 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <h4 className="text-sm sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-xs sm:text-base text-slate-600 max-w-xs mx-auto leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={(el) => {
            sectionsRef.current[2] = el;
          }}
          className={`py-20 sm:py-20 md:py-24 bg-white transition-opacity duration-1000 delay-300 ${
            isVisible["section-2"] ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="container mx-auto px-3 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-6 items-center">
              <div className="relative order-2 lg:order-1 px-1 sm:px-4 lg:px-0 mt-6 sm:mt-0">
                <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 border border-slate-200/50 mx-auto max-w-sm lg:max-w-xl hover:shadow-xl transition-all duration-300">
                  <div className="mb-2 sm:mb-3">
                    <h4 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-xs sm:text-base">
                      Notification Channels
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {[
                        { icon: Mail, name: "Email" },
                        { icon: Smartphone, name: "SMS" },
                        { icon: MessageSquare, name: "Slack" },
                        { icon: Activity, name: "Webhook" },
                      ].map((channel) => (
                        <div
                          key={channel.name}
                          className="flex items-center p-2 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
                        >
                          <channel.icon className="w-3 sm:w-5 h-3 sm:h-5 text-slate-600 mr-1.5 sm:mr-3 group-hover:text-emerald-600 transition-colors duration-200" />
                          <span className="text-xs sm:text-sm font-medium text-black">
                            {channel.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 px-1 sm:px-4 lg:px-0 text-center lg:text-left">
                <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-2 sm:mb-3 hover:bg-emerald-200 transition-colors duration-200">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Integrations
                </div>
                <h3 className="text-fluid-xl sm:text-fluid-2xl md:text-fluid-3xl font-bold tracking-[-0.02em] text-slate-900 mb-1 sm:mb-2 leading-[1.1]">
                  Connect with your
                  <br />
                  existing workflow
                </h3>
                <p className="text-fluid-sm sm:text-fluid-base md:text-fluid-lg text-slate-600 mb-3 sm:mb-4 leading-[1.7] max-w-lg mx-auto lg:mx-0">
                  Seamlessly integrate with your favorite tools and get notified
                  exactly where you want.
                </p>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 w-full sm:w-auto text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={scrollToTop}
                >
                  Join Waitlist
                  <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </section>


        <section
          ref={(el) => {
            sectionsRef.current[3] = el;
          }}
          className={`py-20 sm:py-20 md:py-24 bg-slate-50/50 transition-opacity duration-1000 delay-500 ${
            isVisible["section-3"] ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="container max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <Badge
                variant="secondary"
                className="mb-2 sm:mb-4 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium hover:bg-emerald-100 transition-colors duration-200"
              >
                Why Builders Are Joining
              </Badge>
              <h2 className="text-fluid-2xl sm:text-fluid-3xl md:text-fluid-4xl font-bold tracking-[-0.02em] text-slate-900 mb-3 sm:mb-6 px-1 sm:px-4 lg:px-0 leading-[1.1]">
                Built for Fast‑Moving Teams
              </h2>
              <p className="text-fluid-sm sm:text-fluid-base md:text-fluid-lg text-slate-600 max-w-2xl mx-auto px-1 sm:px-4 lg:px-0 leading-[1.7]">
                Join the early adopters shaping the future of uptime monitoring
              </p>
            </div>

       
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 md:gap-8 mb-8 sm:mb-16 px-1 sm:px-4 lg:px-0">
              {[
                { value: "50K+", label: "Zero-Config Monitoring" },
                { value: "99.9%", label: "Always-On Reliability" },
                { value: "2.3s", label: "Alert Response" },
                { value: "15+", label: "Global Locations" },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="text-fluid-2xl sm:text-fluid-3xl md:text-fluid-4xl font-bold text-emerald-600 mb-1 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-1 sm:px-4 lg:px-0">
              {[
                {
                  quote:
                    "Set up in under 30 seconds and it just works. Finally, monitoring that doesn't get in the way—only alerts when it matters.",
                  author: "Dev Tester",
                  role: "Internal QA, Upbot",
                  badge: "From the Dev Team",
                  gradient: "from-emerald-400 to-teal-400",
                  initials: "DT",
                },
                {
                  quote:
                    "The interface is so clean and intuitive, I felt confident shipping it right away. No more alert fatigue—just actionable notifications.",
                  author: "Siddharth",
                  role: "Community Member",
                  badge: "Early Community",
                  gradient: "from-blue-400 to-cyan-400",
                  initials: "SR",
                },
                {
                  quote:
                    "Sleek, powerful, and exactly what we needed to ensure 24/7 uptime. Feels like a modern status page built by devs, for devs.",
                  author: "Sahil Lenka",
                  role: "Community Member",
                  badge: "Design Preview",
                  gradient: "from-green-400 to-emerald-400",
                  initials: "AT",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className={`border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 ${
                    index === 2 ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <CardContent className="p-6 sm:p-8">
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
                        className="ml-2 sm:ml-3 bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100 transition-colors duration-200"
                      >
                        {testimonial.badge}
                      </Badge>
                    </div>
                    <p className="text-slate-700 mb-4 sm:mb-6 leading-[1.7] text-xs sm:text-base">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r ${testimonial.gradient} mr-3 sm:mr-4 flex items-center justify-center text-white font-semibold text-xs sm:text-base`}
                      >
                        {testimonial.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs sm:text-base">
                          {testimonial.author}
                        </div>
                        <div className="text-xs text-slate-500">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={(el) => {
            sectionsRef.current[4] = el;
          }}
          className={`relative py-20 sm:py-20 md:py-24 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 overflow-hidden transition-opacity duration-1000 delay-700 ${
            isVisible["section-4"] ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:32px_32px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-800/50 via-transparent to-transparent" />

          <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-xs font-medium mb-4 sm:mb-8 hover:bg-emerald-500/30 transition-colors duration-200">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Be one of the first to grab free monitoring with Upbot
              </div>

              <h2 className="text-fluid-3xl sm:text-fluid-4xl md:text-fluid-5xl lg:text-fluid-6xl font-bold tracking-[-0.02em] text-white mb-3 sm:mb-6 px-1 sm:px-4 lg:px-0 leading-[1.1]">
                Start monitoring in
                <span className="text-emerald-200"> 30 seconds</span>
              </h2>

              <p className="text-fluid-base sm:text-fluid-lg md:text-fluid-xl text-emerald-100 mb-6 sm:mb-10 leading-[1.7] max-w-2xl mx-auto px-1 sm:px-4 lg:px-0">
                Always free for hobbyists, no card, no catch
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-12 px-1 sm:px-4 lg:px-0">
                <div className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-600 hover:bg-emerald-50 hover:shadow-xl hover:shadow-white/20 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={scrollToTop}
                  >
                    Join Waitlist
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-emerald-400/30 text-emerald-100 hover:bg-emerald-600/50 bg-transparent px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <a
                    href="https://twitter.com/_shaurya35"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact Us
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-8 text-emerald-200 text-xs sm:text-sm max-w-2xl mx-auto px-1 sm:px-4 lg:px-0">
                {[
                  "Forever‑free tier",
                  "No payment details needed",
                  "Opt out anytime",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center justify-center sm:justify-start"
                  >
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-300 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white">
        <div className="container mx-auto px-3 sm:px-6 lg:px-36 py-8 sm:py-16">
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-5">
            <div className="sm:col-span-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3 sm:mb-6">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Upbot
                </span>
              </div>
              <p className="text-slate-600 mb-3 sm:mb-6 max-w-md text-xs sm:text-base mx-auto sm:mx-0 leading-relaxed">
                The most comprehensive uptime monitoring platform for modern
                applications. Monitor, alert, and analyze with enterprise-grade
                reliability.
              </p>
              <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
                {[
                  {
                    icon: Twitter,
                    href: "https://twitter.com/_shaurya35",
                    label: "Twitter",
                  },
                  {
                    icon: Github,
                    href: "https://github.com/shaurya35/",
                    label: "Github",
                  },
                  {
                    icon: ExternalLink,
                    href: "https://www.shauryacodes.me/",
                    label: "External Link",
                  },
                ].map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 transition-colors duration-200" />
                  </Link>
                ))}
              </div>
            </div>
            {[
              {
                title: "Product",
                links: [
                  { label: "Home", href: "#", external: false },
                  { label: "Features", href: "#", external: false },
                  { label: "Join Waitlist", href: "#", external: false, onClick: scrollToTop },
                ],
              },
              {
                title: "Company",
                links: [
                  {
                    label: "About",
                    href: "https://x.com/_shaurya35",
                    external: true,
                  },
                  {
                    label: "Contact",
                    href: "https://x.com/_shaurya35",
                    external: true,
                  },
                ],
              },
              {
                title: "Resources",
                links: [
                  {
                    label: "Help Center",
                    href: "https://x.com/_shaurya35",
                    external: true,
                  },
                  {
                    label: "Community",
                    href: "https://x.com/_shaurya35",
                    external: true,
                  },
                ],
              },
            ].map((section) => (
              <div key={section.title} className="text-center sm:text-left">
                <h3 className="font-semibold text-slate-900 mb-2 sm:mb-4 text-sm">
                  {section.title}
                </h3>
                <ul className="space-y-1 sm:space-y-3 text-slate-600 text-xs sm:text-base">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="hover:text-emerald-600 transition-colors duration-200 relative group"
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        onClick={link.onClick}
                      >
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-200" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
  );
}
