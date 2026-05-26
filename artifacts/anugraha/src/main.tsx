import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";

import { configureApiClient } from "@anugraha/api-client-react";
import App from "./App";
import "./index.css";

const apiUrl = import.meta.env.VITE_API_URL;
configureApiClient(apiUrl && !apiUrl.includes(":3000") ? apiUrl : "http://localhost:3001");

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
