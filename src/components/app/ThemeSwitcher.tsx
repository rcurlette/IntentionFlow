import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Palette, Sun, Moon, Eye, Zap, Check, Contrast } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, colorTheme, setTheme, setColorTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Palette className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Theme</span>
          {colorTheme === "accessible" && (
            <Badge variant="outline" className="ml-2 text-xs px-1 py-0 h-5">
              <Eye className="h-3 w-3" />
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setColorTheme("accessible")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Contrast className="h-4 w-4" />
            <span>Accessible</span>
          </div>
          {colorTheme === "accessible" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setColorTheme("vibrant")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Vibrant</span>
          </div>
          {colorTheme === "vibrant" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Brightness</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
