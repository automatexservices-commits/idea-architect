import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

/**
 * ThemeToggle — circular icon button that flips light/dark mode.
 * Uses .profile-3d styling for visual consistency with the header.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="profile-3d"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
