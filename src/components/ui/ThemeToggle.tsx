"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (resolvedTheme === "light") {
      setTheme("dark");
    } else if (resolvedTheme === "dark") {
      // Optionally, could cycle to 'system' next, or just back to 'light'
      // For simplicity and to match original request of light/dark toggle:
      setTheme("light");
    } else {
      // Default to light if theme is somehow undefined or system and not resolved
      setTheme("light");
    }
  };

  // Display different content based on resolvedTheme for more accurate icon representation
  // Still using text as icon placeholders
  let buttonContent = "L"; // Default to Light
  if (resolvedTheme === "dark") {
    buttonContent = "D"; // Dark
  }
  // If you want to show "S" for system when theme is system (not resolvedTheme)
  // if (theme === "system") buttonContent = "S";


  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {buttonContent}
    </Button>
  );
}
