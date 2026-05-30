import { type ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

import { isAdminAuthed } from "@/lib/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAdminAuthed()) {
      setLocation("/login");
    }
  }, [setLocation]);

  if (!isAdminAuthed()) return null;
  return <>{children}</>;
}