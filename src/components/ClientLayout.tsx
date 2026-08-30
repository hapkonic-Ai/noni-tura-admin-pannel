"use client";

import { ProtectedRoute } from "./ProtectedRoute";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
