import { getApiBaseUrl } from "@/lib/api-url";

const adminTokenKey = "logindustries-admin-token";
const adminAuthEvent = "logindustries-admin-auth-change";

export function subscribeToAdminAuth(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(adminAuthEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(adminAuthEvent, onChange);
  };
}

export function getAdminToken() {
  return window.sessionStorage.getItem(adminTokenKey);
}

export function getServerAdminToken() {
  return null;
}

export function setAdminToken(token: string) {
  window.sessionStorage.setItem(adminTokenKey, token);
  window.dispatchEvent(new Event(adminAuthEvent));
}

export function clearAdminToken() {
  window.sessionStorage.removeItem(adminTokenKey);
  window.dispatchEvent(new Event(adminAuthEvent));
}

export async function adminRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(typeof FormData !== "undefined" && init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const result = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(result?.error || `Admin API failed (${response.status}).`);
  return result as T;
}