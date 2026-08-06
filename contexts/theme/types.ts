import type { Theme } from "@/lib/enums/theme";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

