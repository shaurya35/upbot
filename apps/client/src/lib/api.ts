import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { BACKEND_URL } from "@/configs/env";

export type User = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  signupMethod: string;
};

export type CheckStatus = "UP" | "DOWN" | "UNKNOWN";

export type Website = {
  id: string;
  name: string;
  url: string;
  monitorInterval: number;
  createdAt: string;
  status: CheckStatus;
  lastCheckedAt: string | null;
  lastResponseTime: number | null;
  uptime24h: number | null;
  avgResponseTime24h: number | null;
};

export type StatsRange = "24h" | "7d" | "30d";

export type WebsiteStats = {
  range: StatsRange;
  bucketSeconds: number;
  buckets: { time: string; total: number; up: number; down: number; avgResponseTime: number | null }[];
  summary: {
    totalChecks: number;
    uptime: number | null;
    avgResponseTime: number | null;
    minResponseTime: number | null;
    maxResponseTime: number | null;
  };
  uptime: Record<StatsRange, number | null>;
};

export type Check = {
  id: string;
  status: CheckStatus;
  responseTime: number;
  statusCode: number | null;
  error: string | null;
  createdAt: string;
  region: { code: string; name: string };
};

export type Incident = { id: string; startedAt: string; recoveredAt: string | null; reason: string | null; deliveries: { id: string; eventType: string; status: string; attempts: number }[] };

export type AlertType = "EMAIL" | "SMS" | "DISCORD" | "SLACK" | "WEBHOOK" | "TELEGRAM";

export type AlertChannel = {
  id: string;
  type: AlertType;
  webhookUrl: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
};

export type Session = { accessToken: string; user: User };

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const refreshSession = async (): Promise<Session | null> => {
  try {
    const { data } = await axios.post<Session>(`${BACKEND_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
    setAccessToken(data.accessToken);
    return data;
  } catch {
    setAccessToken(null);
    return null;
  }
};

let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

let refreshing: Promise<Session | null> | null = null;
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  if (error.response?.status !== 401 || !config || config._retried) {
    throw error;
  }

  config._retried = true;
  refreshing ??= refreshSession().finally(() => {
    refreshing = null;
  });
  const session = await refreshing;
  if (!session) {
    onSessionExpired?.();
    throw error;
  }
  return api(config);
});

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message || data?.error) return (data.message || data.error) as string;
  }
  return error instanceof Error ? error.message : "Something went wrong";
};

export const authApi = {
  signin: (email: string, password: string) =>
    api.post<Session>("/auth/signin", { email, password }).then((r) => r.data),
  signup: (body: { name: string; email: string; company?: string; password: string }) =>
    api.post("/auth/signup", body).then((r) => r.data),
  verifyOtp: (body: { email: string; otp: string; name: string; company?: string; password: string }) =>
    api.post<Session>("/auth/verify-otp", body).then((r) => r.data),
  resendOtp: (email: string) => api.post("/auth/resend-otp", { email }).then((r) => r.data),
  signout: () => api.post("/auth/signout").then((r) => r.data),
};

export const profileApi = {
  get: () => api.get<{ profile: User }>("/profile").then((r) => r.data.profile),
  update: (body: { name?: string; company?: string | null }) =>
    api.put<{ profile: User }>("/profile", body).then((r) => r.data.profile),
};

export const websiteApi = {
  list: () => api.get<Website[]>("/website").then((r) => r.data),
  get: (id: string) => api.get<Website>(`/website/${id}`).then((r) => r.data),
  create: (body: { name: string; url: string; monitorInterval?: number }) =>
    api.post<{ website: Website }>("/website", body).then((r) => r.data.website),
  update: (id: string, body: { name?: string; url?: string; monitorInterval?: number }) =>
    api.put<{ website: Website }>(`/website/${id}`, body).then((r) => r.data.website),
  remove: (id: string) => api.delete(`/website/${id}`).then((r) => r.data),
  stats: (id: string, range: StatsRange) =>
    api.get<WebsiteStats>(`/website/${id}/stats`, { params: { range } }).then((r) => r.data),
  incidents: (id: string) => api.get<Incident[]>(`/website/${id}/incidents`).then((r) => r.data),
  checks: (id: string, limit = 50) =>
    api.get<Check[]>(`/website/${id}/checks`, { params: { limit } }).then((r) => r.data),
};

export const alertApi = {
  list: () => api.get<AlertChannel[]>("/alert").then((r) => r.data),
  create: (body: { type: AlertType; webhookUrl?: string; email?: string; phone?: string }) =>
    api.post<{ alertChannel: AlertChannel }>("/alert", body).then((r) => r.data.alertChannel),
  remove: (id: string) => api.delete(`/alert/${id}`).then((r) => r.data),
};
