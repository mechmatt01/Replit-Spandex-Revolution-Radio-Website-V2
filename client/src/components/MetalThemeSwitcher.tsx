import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Palette, 
  Sun, 
  Moon, 
  Skull, 
  Flame, 
  Crown, 
  TreePine, 
  Zap, 
  Heart 
} from "lucide-react";
import { useTheme, METAL_THEMES, type MetalTheme } from "@/contexts/ThemeContext";

const THEME_ICONS: Record<MetalTheme, React.ReactNode> = {
  "classic-metal": <Flame className="w-4 h-4" />,
  "black-metal": <Skull className="w-4 h-4" />,
  "death-metal": <Skull className="w-4 h-4" />,
  "power-metal": <Crown className="w-4 h-4" />,
  "doom-metal": <TreePine className="w-4 h-4" />,
  "thrash-metal": <Zap className="w-4 h-4" />,
  "gothic-metal": <Heart className="w-4 h-4" />
};

export default function MetalThemeSwitcher() {
  const { currentTheme, lightMode, setTheme, toggleLightMode, getColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const colors = getColors();

  return (
    <div className="flex items-center gap-2">
      {/* Light/Dark Mode Toggle */}
      <Button
        onClick={toggleLightMode}
        variant="ghost"
        size="sm"
        className="w-9 h-9 p-0 hover:bg-opacity-20"
        style={{ 
          color: colors.text,
          backgroundColor: 'transparent'
        }}
      >
        {lightMode ? (
          <Moon className="w-4 h-4" style={{ color: colors.primary }} />
        ) : (
          <Sun className="w-4 h-4" style={{ color: colors.primary }} />
        )}
      </Button>

      {/* Theme Selector */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-opacity-20"
            style={{ 
              color: colors.text,
              backgroundColor: 'transparent'
            }}
          >
            <Palette className="w-4 h-4" style={{ color: colors.primary }} />
            <span className="hidden sm:inline text-sm font-medium">
              {METAL_THEMES[currentTheme].name}
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-80 p-0 border-0"
          style={{ 
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}
        >
          <Card 
            className="border-0 shadow-xl"
            style={{ backgroundColor: colors.surface }}
          >
            <CardHeader className="pb-3">
              <CardTitle 
                className="text-lg font-black flex items-center gap-2"
                style={{ color: colors.text }}
              >
                <Palette className="w-5 h-5" style={{ color: colors.primary }} />
                Metal Themes
              </CardTitle>
              <p 
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                Choose your metal aesthetic
              </p>
            </CardHeader>
            
            <CardContent className="space-y-2">
              {Object.entries(METAL_THEMES).map(([themeKey, themeConfig]) => {
                const isActive = currentTheme === themeKey;
                const themeColors = themeConfig.colors[lightMode ? "light" : "dark"];
                
                return (
                  <Button
                    key={themeKey}
                    onClick={() => {
                      setTheme(themeKey as MetalTheme);
                      setIsOpen(false);
                    }}
                    variant="ghost"
                    className={`w-full justify-start p-3 h-auto hover:bg-opacity-20 ${
                      isActive ? 'ring-2' : ''
                    }`}
                    style={{ 
                      backgroundColor: isActive ? `${colors.primary}20` : 'transparent',
                      borderColor: isActive ? colors.primary : 'transparent',
                      color: colors.text
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {/* Theme Icon */}
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ 
                          background: themeConfig.gradient,
                          color: '#ffffff'
                        }}
                      >
                        {THEME_ICONS[themeKey as MetalTheme]}
                      </div>
                      
                      {/* Theme Info */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {themeConfig.name}
                          </span>
                          {isActive && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs px-2 py-0"
                              style={{ 
                                backgroundColor: colors.primary,
                                color: colors.background
                              }}
                            >
                              Active
                            </Badge>
                          )}
                        </div>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: colors.textSecondary }}
                        >
                          {themeConfig.description}
                        </p>
                      </div>
                      
                      {/* Color Preview */}
                      <div className="flex gap-1">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ 
                            backgroundColor: themeColors.primary,
                            borderColor: colors.border
                          }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ 
                            backgroundColor: themeColors.secondary,
                            borderColor: colors.border
                          }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ 
                            backgroundColor: themeColors.accent,
                            borderColor: colors.border
                          }}
                        />
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}