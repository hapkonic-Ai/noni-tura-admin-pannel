import { getToken, removeToken } from "./api";

export interface JwtPayload {
  phone: string;
  role: string;
  admin_id?: string;
  doctor_id?: string;
  nurse_id?: string;
  patient_id?: string;
  exp?: number;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getPayload(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  return parseJwt(token);
}

export function isStaff(): boolean {
  const payload = getPayload();
  return payload?.role === "admin" || payload?.role === "superadmin";
}

export function logout() {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
