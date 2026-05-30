import { useEffect } from "react";
import { useLocation } from "wouter";

import { AdminGuard } from "@/components/AdminGuard";
import LoginPage from "@/pages/LoginPage";
import AdminPage from "@/pages/AdminPage";
import { RequireAuth } from "@/components/RequireAuth";
import { isAdminAuthed } from "@/lib/auth";

export default function App() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (location === "/") {
      setLocation(isAdminAuthed() ? "/dashboard" : "/login");
    }
  }, [location, setLocation]);

  if (location === "/" || location === "") return null;

  if (location === "/login") {
    return <LoginPage />;
  }

  return (
    <RequireAuth>
      <AdminGuard>
        <AdminPage />
      </AdminGuard>
    </RequireAuth>
  );
}