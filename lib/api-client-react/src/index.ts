import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import {
  callbackSchema,
  dashboardStatsSchema,
  projectSchema,
  publicStatsSchema,
  siteSettingsSchema,
  serviceSchema,
  teamMemberSchema,
  testimonialSchema
} from "./schemas";

let apiBaseUrl = "";

export function configureApiClient(baseUrl: string) {
  apiBaseUrl = baseUrl;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}

async function request(path: string, init?: RequestInit) {
  const token = isBrowser() ? localStorage.getItem("anugraha_token") : null;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    let body = null;
    try {
      body = await response.text();
    } catch (_e) {
      /* ignore */
    }
    throw new Error(`Request failed: ${response.status}${body ? ` - ${body}` : ""}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function parseArray<T>(schema: z.ZodType<T>, value: unknown) {
  return z.array(schema).parse(value);
}

function isBrowser() {
  return typeof window !== "undefined";
}

function useInvalidation(keys: Array<readonly unknown[]>) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  };
}

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => publicStatsSchema.parse(await request("/api/stats")),
    refetchOnWindowFocus: true,
    refetchInterval: 30_000
  });
}

export function useFeaturedProjects() {
  return useQuery({
    queryKey: ["projects", "featured"],
    queryFn: async () => parseArray(projectSchema, await request("/api/projects/featured")),
    refetchOnWindowFocus: true,
    refetchInterval: 30_000
  });
}

export function useProject(projectId?: number) {
  return useQuery({
    queryKey: ["project", projectId],
    enabled: Number.isFinite(projectId),
    queryFn: async () => projectSchema.parse(await request(`/api/projects/${projectId}`))
  });
}

export function useOngoingProjects() {
  return useQuery({
    queryKey: ["projects", "ongoing"],
    queryFn: async () => parseArray(projectSchema, await request("/api/projects/ongoing")),
    refetchOnWindowFocus: true,
    refetchInterval: 30_000
  });
}

export function useProjects(status?: string) {
  return useQuery({
    queryKey: ["projects", status ?? "all"],
    queryFn: async () => parseArray(projectSchema, await request(`/api/projects${status ? `?status=${status}` : ""}`)),
    refetchOnWindowFocus: true,
    refetchInterval: 30_000
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => parseArray(serviceSchema, await request("/api/services")),
    // keep services reasonably fresh: refetch on window focus and poll every 30s
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
    staleTime: 10_000
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => parseArray(testimonialSchema, await request("/api/testimonials")),
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
    staleTime: 5_000
  });
}

export function useCallbacks() {
  return useQuery({
    queryKey: ["callbacks"],
    queryFn: async () => parseArray(callbackSchema, await request("/api/callbacks")),
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
    staleTime: 5_000
  });
}

export function useTeam() {
  return useQuery({
    queryKey: ["team"],
    queryFn: async () => parseArray(teamMemberSchema, await request("/api/team")),
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
    staleTime: 5_000
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => siteSettingsSchema.parse(await request("/api/settings")),
    staleTime: 5_000,
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
    retry: 0
  });
}

export function useUpdateSiteSettings() {
  const invalidate = useInvalidation([["site-settings"], ["public-stats"]]);
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => request("/api/settings", { method: "PUT", body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await invalidate();
    }
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => dashboardStatsSchema.parse(await request("/api/stats/dashboard")),
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
    staleTime: 5_000
  });
}

export function useCreateCallback() {
  const invalidate = useInvalidation([["callbacks"], ["dashboard-stats"]]);
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return await request("/api/public/callbacks", { method: "POST", body: JSON.stringify(payload) });
    },
    onSuccess: async () => {
      await invalidate();
    }
  });
}

export async function login(username: string, password: string) {
  const resp = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
  if (resp && (resp as any).token) {
    if (isBrowser()) localStorage.setItem("anugraha_token", (resp as any).token);
    return (resp as any).token;
  }
  throw new Error("Login failed");
}

export function logout() {
  if (!isBrowser()) return;
  localStorage.removeItem("anugraha_token");
}

export function setAuthToken(token: string | null) {
  if (!isBrowser()) return;
  if (!token) localStorage.removeItem("anugraha_token"); else localStorage.setItem("anugraha_token", token);
}

function createMutation(path: string, method: string, invalidateKeys: Array<readonly unknown[]>) {
  const invalidate = useInvalidation(invalidateKeys);
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => request(path, { method, body: JSON.stringify(payload) }),
    onSuccess: invalidate
  });
}

export function useCreateProject() {
  return createMutation("/api/projects", "POST", [["projects"], ["projects", "featured"], ["projects", "ongoing"], ["dashboard-stats"], ["public-stats"]]);
}

export function useUpdateProject() {
  const invalidate = useInvalidation([["projects"], ["projects", "featured"], ["projects", "ongoing"], ["dashboard-stats"], ["public-stats"], ["project"]]);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => request(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: invalidate
  });
}

export function useDeleteProject() {
  const invalidate = useInvalidation([["projects"], ["projects", "featured"], ["projects", "ongoing"], ["dashboard-stats"], ["public-stats"], ["project"]]);
  return useMutation({
    mutationFn: (id: number) => request(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: invalidate
  });
}

export function useCreateService() {
  return createMutation("/api/services", "POST", [["services"], ["dashboard-stats"]]);
}

export function useUpdateService() {
  const invalidate = useInvalidation([["services"], ["dashboard-stats"]]);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => request(`/api/services/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: invalidate
  });
}

export function useDeleteService() {
  const invalidate = useInvalidation([["services"], ["dashboard-stats"]]);
  return useMutation({
    mutationFn: (id: number) => request(`/api/services/${id}`, { method: "DELETE" }),
    onSuccess: invalidate
  });
}

export function useCreateTestimonial() {
  return createMutation("/api/testimonials", "POST", [["testimonials"], ["dashboard-stats"]]);
}

export function useUpdateTestimonial() {
  const invalidate = useInvalidation([["testimonials"], ["dashboard-stats"]]);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => request(`/api/testimonials/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: invalidate
  });
}

export function useDeleteTestimonial() {
  const invalidate = useInvalidation([["testimonials"], ["dashboard-stats"]]);
  return useMutation({
    mutationFn: (id: number) => request(`/api/testimonials/${id}`, { method: "DELETE" }),
    onSuccess: invalidate
  });
}

export function useUpdateCallback() {
  const invalidate = useInvalidation([["callbacks"], ["dashboard-stats"]]);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => request(`/api/callbacks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: invalidate
  });
}

export function useDeleteCallback() {
  const invalidate = useInvalidation([["callbacks"], ["dashboard-stats"]]);
  return useMutation({
    mutationFn: (id: number) => request(`/api/callbacks/${id}`, { method: "DELETE" }),
    onSuccess: invalidate
  });
}

export function useCreateTeamMember() {
  return createMutation("/api/team", "POST", [["team"], ["dashboard-stats"], ["public-stats"]]);
}

export function useUpdateTeamMember() {
  const invalidate = useInvalidation([["team"], ["dashboard-stats"], ["public-stats"]]);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) => request(`/api/team/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: invalidate
  });
}

export function useDeleteTeamMember() {
  const invalidate = useInvalidation([["team"], ["dashboard-stats"], ["public-stats"]]);
  return useMutation({
    mutationFn: (id: number) => request(`/api/team/${id}`, { method: "DELETE" }),
    onSuccess: invalidate
  });
}
