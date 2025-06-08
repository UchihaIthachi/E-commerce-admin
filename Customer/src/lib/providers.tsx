"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";

const queryClient = new QueryClient();

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">{children}</ThemeProvider>
    </QueryClientProvider>
  );
}

export default Providers;
