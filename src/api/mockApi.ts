export interface User {
  username: string;
  password: string;
  role: "Admin" | "Editor" | "Viewer";
  name: string;
}

export interface DecodedJWT {
  sub: string;
  username: string;
  role: "Admin" | "Editor" | "Viewer";
  name: string;
  iat: number;
  exp: number;
}

export interface JWTHeader {
  alg: string;
  typ: string;
}

export interface LoginResponse {
  token: string;
  user: {
    username: string;
    role: "Admin" | "Editor" | "Viewer";
    name: string;
  };
}

export const SYNTHETIC_USERS: User[] = [
  {
    username: "admin",
    password: "1234",
    role: "Admin",
    name: "Admin",
  },
  {
    username: "editor",
    password: "1234",
    role: "Editor",
    name: "Editor",
  },
  {
    username: "viewer",
    password: "1234",
    role: "Viewer",
    name: "Viewer",
  },
];

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

export function generateJWT(user: User): string {
  const header: JWTHeader = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: DecodedJWT = {
    sub: user.username,
    username: user.username,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(`mock_signature_key_${user.username}_${now}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function decodeToken(token: string): { header: JWTHeader; payload: DecodedJWT } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    return { header, payload };
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
}

export function login(username: string, password: string): LoginResponse | null {
  const user = SYNTHETIC_USERS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password
  );

  if (!user) {
    return null;
  }

  const token = generateJWT(user);

  return {
    token,
    user: {
      username: user.username,
      role: user.role,
      name: user.name,
    },
  };
}

import type { Post } from "../features/posts/postsSlice";

const DRAFTS_KEY = "drafts";

function getStoredDrafts(): Post[] {
  try {
    const data = localStorage.getItem(DRAFTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredDrafts(drafts: Post[]): void {
  try {
    // Strip images before persisting — base64 strings are too large for localStorage.
    // Images live in Redux memory only and are re-uploaded when editing.
    const slim = drafts.map(({ images: _images, image: _image, ...rest }) => rest);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(slim));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

export const mockApi = {
  async loadDrafts(): Promise<Post[]> {
    return getStoredDrafts();
  },
  async saveDraft(draft: Post): Promise<Post> {
    const drafts = getStoredDrafts();
    drafts.push(draft);
    saveStoredDrafts(drafts);
    return draft;
  },
  async updateDraft(id: string, changes: Partial<Post>): Promise<Post | null> {
    const drafts = getStoredDrafts();
    const index = drafts.findIndex((d) => d.id === id);
    if (index === -1) return null;
    const updated = { ...drafts[index], ...changes };
    drafts[index] = updated;
    saveStoredDrafts(drafts);
    return updated;
  },
  async deleteDraft(id: string): Promise<boolean> {
    const drafts = getStoredDrafts();
    const filtered = drafts.filter((d) => d.id !== id);
    saveStoredDrafts(filtered);
    return true;
  },
};