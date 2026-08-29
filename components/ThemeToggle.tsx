
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      className="
        flex h-11 w-11 items-center justify-center
        rounded-full
        bg-gray-100 text-gray-700
        transition-all duration-200
        hover:bg-gray-200
        active:scale-95
        dark:bg-[#2a2521]
        dark:text-gray-200
        dark:hover:bg-[#352e29]
      "
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}

