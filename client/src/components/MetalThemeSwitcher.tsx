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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Palette, 
  Sun, 
  Moon, 
  Skull, 
  Flame, 
  Crown, 
  TreePine, 
  Zap, 
  Heart,
  Sparkles,
  Star
} from "lucide-react";
import { useTheme, METAL_THEMES, type MetalTheme } from "@/contexts/ThemeContext";

const THEME_ICONS: Record<MetalTheme, React.ReactNode> = {
  "classic-metal": <Flame className="w-4 h-4" />,
  "black-metal": <Skull className="w-4 h-4" />,
  "death-metal": <Skull className="w-4 h-4" />,
  "power-metal": <Crown className="w-4 h-4" />,
  "doom-metal": <TreePine className="w-4 h-4" />,
  "thrash-metal": <Zap className="w-4 h-4" />,
  "gothic-metal": <Heart className="w-4 h-4" />,
  "light-mode": <Sun className="w-4 h-4" />,
  "dark-mode": <Moon className="w-4 h-4" />,
  "glassmorphism-premium": <Sparkles className="w-4 h-4" />
};

export default function MetalThemeSwitcher() {
  const { currentTheme, setTheme, getColors } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const colors = getColors();

  const hasActiveSubscription = user?.subscriptionStatus === 'active';

  const handleThemeClick = (themeKey: string, themeConfig: any) => {
    if (themeConfig.isPremium && !hasActiveSubscription) {
      setShowPremiumDialog(true);
      return;
    }
    
    setTheme(themeKey as MetalTheme);
    setIsOpen(false);
  };

  const scrollToSubscription = () => {
    setShowPremiumDialog(false);
    setIsOpen(false);
    const subscriptionElement = document.getElementById('subscription-section');
    if (subscriptionElement) {
      subscriptionElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  // Sort themes to put active theme first, then premium themes, then regular themes
  const sortedThemes = Object.entries(METAL_THEMES).sort(([keyA, configA], [keyB, configB]) => {
    if (keyA === currentTheme) return -1;
    if (keyB === currentTheme) return 1;
    if (configA.isPremium && !configB.isPremium) return -1;
    if (!configA.isPremium && configB.isPremium) return 1;
    return 0;
  });

  return (
    <div className="flex items-center gap-2">
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
          className="w-80 p-0 border-0 max-h-[80vh] overflow-hidden"
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
                Theme Selector
              </CardTitle>
              <p 
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                Choose your visual theme
              </p>
            </CardHeader>
            
            <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto pt-4">
              {sortedThemes.map(([themeKey, themeConfig]) => {
                const isActive = currentTheme === themeKey;
                const isLightTheme = themeKey === "light-mode";
                const themeColors = themeConfig.colors[isLightTheme ? "light" : "dark"];
                const isPremium = themeConfig.isPremium;
                const isLocked = isPremium && !hasActiveSubscription;
                
                return (
                  <Button
                    key={themeKey}
                    onClick={() => handleThemeClick(themeKey, themeConfig)}
                    variant="ghost"
                    className={`w-full justify-start p-3 h-auto hover:bg-opacity-20 ${
                      isActive ? 'ring-2' : ''
                    } ${isLocked ? 'opacity-75' : ''}`}
                    style={{ 
                      backgroundColor: isActive ? `${colors.primary}20` : 'transparent',
                      borderColor: isActive ? colors.primary : 'transparent',
                      color: colors.text
                    }}
                  >
                    <div className="flex items-start gap-3 w-full">
                      {/* Theme Icon */}
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: themeKey === 'dark-mode' 
                            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
                            : themeKey === 'glassmorphism-premium'
                            ? 'linear-gradient(135deg, #8b0080 0%, #ff0080 25%, #ff6600 50%, #cc9900 75%, #ff0080 100%)'
                            : themeConfig.gradient,
                          color: '#ffffff'
                        }}
                      >
                        {THEME_ICONS[themeKey as MetalTheme]}
                      </div>
                      
                      {/* Theme Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <span 
                              className="font-semibold text-sm"
                              style={{ color: themeColors.primary }}
                            >
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
                          {isPremium && (
                            <Star 
                              className="w-4 h-4 flex-shrink-0"
                              style={{ 
                                color: '#ffd700',
                                fill: '#ffd700',
                                filter: isLocked ? 'grayscale(100%) opacity(0.5)' : 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.3))'
                              }}
                            />
                          )}
                        </div>
                        <p 
                          className="text-xs mt-1 break-words leading-relaxed whitespace-pre-wrap overflow-hidden"
                          style={{ 
                            color: themeColors.primary,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                        >
                          {themeConfig.description}
                        </p>
                        
                        {/* Color Preview - Moved Below */}
                        <div className="flex gap-1 mt-2">
                          {themeKey === 'glassmorphism-premium' ? (
                            <div className="flex gap-1">
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: '#8b0080', borderColor: colors.border }} />
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: '#ff0080', borderColor: colors.border }} />
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: '#ff6600', borderColor: colors.border }} />
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: '#cc9900', borderColor: colors.border }} />
                            </div>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>

            {/* Premium Theme Dialog */}
            <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
              <DialogContent 
                className="sm:max-w-md border-0"
                style={{ 
                  background: 'linear-gradient(135deg, #8b0080 0%, #ff0080 25%, #ff6600 50%, #cc9900 75%, #ff0080 100%)',
                  backgroundSize: '400% 400%',
                  animation: 'glassmorphGradient 8s ease infinite',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)'
                }}
              >
                <div 
                  className="rounded-lg p-4 max-w-md mx-auto"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)'
                  }}
                >
                  <DialogHeader className="text-center space-y-3">
                    <div className="flex justify-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <DialogTitle className="text-xl font-bold text-white leading-tight">
                      Glassmorphism Rock Theme
                    </DialogTitle>
                    <DialogDescription className="text-white/90 text-sm leading-relaxed px-2">
                      Experience the ultimate rock vibe with our premium glassmorphism theme featuring vibrant colors and stunning glass effects.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="mt-4 space-y-4">
                    <div className="text-center">
                      <p className="text-white/80 text-xs">
                        This premium theme includes:
                      </p>
                      <ul className="text-white text-xs mt-2 space-y-1 leading-relaxed">
                        <li>• Vibrant gradient backgrounds</li>
                        <li>• Glass morphism effects</li>
                        <li>• Rock-inspired color palette</li>
                        <li>• Enhanced visual experience</li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => setShowPremiumDialog(false)}
                        variant="ghost"
                        className="flex-1 text-white border border-white/30 hover:bg-white/20 font-semibold px-4 py-2 text-sm"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '6px'
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={scrollToSubscription}
                        className="flex-1 font-bold px-4 py-2 text-sm text-white"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '6px',
                          boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        Get Premium
                      </Button>
                    </div>
                    
                    {/* TEMPORARY TESTING BUTTON - REMOVE BEFORE DEPLOYMENT */}
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <Button
                        onClick={() => {
                          setTheme('glassmorphism-premium' as MetalTheme);
                          setShowPremiumDialog(false);
                          setIsOpen(false);
                        }}
                        className="w-full font-semibold px-4 py-2 text-xs text-yellow-300"
                        style={{
                          background: 'rgba(255, 215, 0, 0.2)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 215, 0, 0.4)',
                          borderRadius: '6px',
                          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)'
                        }}
                      >
                        Test Theme (Development Use Only)
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}