/**
 * backendApi.ts
 *
 * HTTP client for the Spring Boot backend (http://localhost:8080).
 * Handles all post scheduling API calls: create, read, update, delete.
 *
 * Maps between the frontend Post shape and the backend PostRequestDto:
 *
 *   Frontend Post        Backend DTO
 *   ─────────────        ───────────
 *   platform        <->  platform
 *   content         <->  content
 *   scheduledAt     <->  scheduledAt (ISO-8601 without trailing 'Z')
 *   date            <->  derived from scheduledAt
 *   id (string)     <->  id (Long, stored as string)
 *
 * Images are frontend-only (localStorage) — backend does not store them.
 */

import type { Post } from "../features/posts/postsSlice";

const BASE_URL = "http://localhost:8080/api";

// ─── Types matching the backend JSON exactly ─────────────────────────────────

interface BackendPost {
  id: number;
  platform: string;
  content: string;
  scheduledAt: string | null;   // LocalDateTime → "2026-10-01T10:00:00"
  status: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface BackendRequest {
  platform: string;
  content: string;
  scheduledAt: string;          // "2026-10-01T10:00:00" (no Z, no timezone)
  status?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts a full ISO string ("2026-10-01T04:30:00.000Z") to the LocalDateTime
 * format that Spring Boot expects ("2026-10-01T10:00:00") — strips the 'Z'
 * and uses local time representation.
 */
function toLocalDateTime(isoString: string): string {
  if (!isoString) return new Date().toISOString().slice(0, 19);
  // Remove trailing Z so Spring treats it as local time, not UTC
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Converts a backend BackendPost into a frontend Post.
 * Assigns a string ID prefixed with "api-" to distinguish from localStorage IDs.
 */
function toFrontendPost(bp: BackendPost, images: string[] = []): Post {
  const scheduledAt = bp.scheduledAt ? new Date(bp.scheduledAt).toISOString() : "";
  const date = bp.scheduledAt ? bp.scheduledAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: `api-${bp.id}`,
    platform: bp.platform,
    content: bp.content,
    scheduledAt,
    date,
    images,
  };
}

/**
 * Generic fetch wrapper — throws a readable error if the response is not ok.
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok) {
    const msg = (json as unknown as { message?: string }).message || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  return json.data;
}

// Cache reachability — avoids blocking every save with a fresh 2-second timeout
let _reachableCache: boolean | null = null;
let _reachableAt = 0;
const CACHE_TTL_MS = 10_000;

// ─── Public API ───────────────────────────────────────────────────────────────

export const backendApi = {

  /** Load all scheduled posts from the backend */
  async loadAll(): Promise<Post[]> {
    const posts = await apiFetch<BackendPost[]>("/posts");
    return posts.map((p) => toFrontendPost(p));
  },

  /** Create a new scheduled post */
  async create(draft: Omit<Post, "id">): Promise<Post> {
    const body: BackendRequest = {
      platform: draft.platform,
      content: draft.content,
      scheduledAt: toLocalDateTime(draft.scheduledAt || draft.date || new Date().toISOString()),
      status: "scheduled",
    };
    const created = await apiFetch<BackendPost>("/posts", {
      method: "POST",
      body: JSON.stringify(body),
    });
    // Preserve images from frontend (backend doesn't store them)
    return toFrontendPost(created, draft.images ?? []);
  },

  /** Update an existing post (e.g. after drag-and-drop rescheduling) */
  async update(id: string, changes: Partial<Post>): Promise<Post> {
    // Strip the "api-" prefix to get the numeric backend ID
    const numericId = id.replace("api-", "");

    // Fetch the current post to fill required fields if not provided in changes
    const current = await apiFetch<BackendPost>(`/posts/${numericId}`);

    // Explicit parens so ?? does not compete with the ternary
    const resolvedScheduledAt =
      changes.scheduledAt ??
      (changes.date
        ? `${changes.date}T10:00:00`
        : (current.scheduledAt ?? new Date().toISOString()));

    const body: BackendRequest = {
      platform: changes.platform ?? current.platform,
      content: changes.content ?? current.content,
      scheduledAt: toLocalDateTime(resolvedScheduledAt),
      status: "scheduled",
    };

    const updated = await apiFetch<BackendPost>(`/posts/${numericId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return toFrontendPost(updated, changes.images ?? []);
  },

  /** Delete a post by frontend ID */
  async remove(id: string): Promise<void> {
    const numericId = id.replace("api-", "");
    await apiFetch<null>(`/posts/${numericId}`, { method: "DELETE" });
  },

  /**
   * Health check — returns true if the backend is reachable.
   * Called once on app load; if backend is down, falls back to localStorage.
   */
  async isReachable(): Promise<boolean> {
    const now = Date.now();
    if (_reachableCache !== null && now - _reachableAt < CACHE_TTL_MS) {
      return _reachableCache;
    }
    try {
      // Use /api/health — the health endpoint is at /api/health on the backend
      const res = await fetch(`${BASE_URL}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      _reachableCache = res.ok;
    } catch {
      _reachableCache = false;
    }
    _reachableAt = Date.now();
    return _reachableCache;
  },
};
