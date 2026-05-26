import { useLocation } from "wouter";

import { AdminGuard } from "@/components/AdminGuard";
import HomePage from "@/pages/HomePage";
import AdminPage from "@/pages/AdminPage";
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";

export default function App() {
  const [location] = useLocation();

  if (location.startsWith("/admin")) {
    return (
      <AdminGuard>
        <AdminPage />
      </AdminGuard>
    );
  }

  if (location.startsWith("/projects/")) {
    return <ProjectDetailsPage />;
  }

  return <HomePage />;
}
