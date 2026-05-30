import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";

import { configureApiClient } from "@anugraha/api-client-react";
import App from "./App";
import "./index.css";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "https://anugraha-api.onrender.com";

configureApiClient(apiBaseUrl);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  </StrictMode>
);