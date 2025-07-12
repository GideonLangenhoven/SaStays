// src/components/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-10 h-10 transition-all duration-300 hover:bg-muted"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 transition-transform duration-500 rotate-0" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-500 rotate-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}