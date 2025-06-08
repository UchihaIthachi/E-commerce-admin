"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button"; // Assuming Button is already imported

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  // Render a consistent button structure, but delay rendering the theme-specific icon/text
  // until mounted. This ensures server and client render the same initial output for the icon part.
  // You could also render a generic placeholder icon here if preferred.
  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {mounted ? (resolvedTheme === "light" ? "L" : "D") : null}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
