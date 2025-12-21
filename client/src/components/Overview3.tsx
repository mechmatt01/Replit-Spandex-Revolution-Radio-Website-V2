import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ShoppingBag, PackageSearch, Zap, Star, Crown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const PRODUCTS = [
  { id:'p1', name:'SSR Neon Tee', price:'$28', img:'https://picsum.photos/seed/tee/200', url:'#' },
  { id:'p2', name:'SSR Chrome Sticker', price:'$6', img:'https://picsum.photos/seed/sticker/200', url:'#' },
  { id:'p3', name:'SSR Trucker Hat', price:'$24', img:'https://picsum.photos/seed/hat/200', url:'#' },
  { id:'p4', name:'SSR Patch Set', price:'$12', img:'https://picsum.photos/seed/patch/200', url:'#' },
];

const SUBSCRIPTION_TIERS = [
  { name: 'REBEL', price: '$10/mo', icon: Zap },
  { name: 'LEGEND', price: '$15/mo', icon: Star },
  { name: 'ICON', price: '$24.99/mo', icon: Crown },
];

export default function Overview3() {
  const { getColors } = useTheme();
  const colors = getColors();
  const pick = React.useMemo(()=> PRODUCTS[Math.floor(Math.random()*PRODUCTS.length)], []);

  const handleSignUp = () => {
    const authModal = document.querySelector('[role="dialog"]');
    if (authModal) {
      const signUpTab = authModal.querySelector('[data-state="inactive"]');
      if (signUpTab) signUpTab.click();
    }
  };

  const handleMerch = () => {
    window.location.hash = '#merch';
    setTimeout(() => {
      const merchSection = document.getElementById('merch');
      if (merchSection) merchSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubscribe = () => {
    window.location.hash = '#subscribe';
    setTimeout(() => {
      const subscribeSection = document.getElementById('subscribe');
      if (subscribeSection) subscribeSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section id="overview" className="py-16" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-8" style={{ color: colors.text }}>
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Box 1: Sign Up / Join the Hairspray Rebellion */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" style={{ backgroundColor: colors.surface, borderColor: colors.primary, border: `2px solid ${colors.primary}` }} onClick={handleSignUp}>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus size={28} style={{ color: colors.primary }} />
                <h3 className="font-orbitron text-lg font-bold" style={{ color: colors.text }}>Join the Rebellion</h3>
              </div>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: colors.textMuted }}>
                Create your free account to access <strong style={{color: colors.text}}>24/7 metal streaming</strong>, unlock exclusive <strong style={{color: colors.text}}>themes</strong>, chat with fellow metalheads, and submit your music. Be part of the Hairspray Rebellion!
              </p>
              <Button className="w-full font-orbitron font-bold" style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}>
                Sign Up Free
              </Button>
            </CardContent>
          </Card>

          {/* Box 2: Product Showcase - Rotates on Each Reload */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" style={{ backgroundColor: colors.surface, borderColor: colors.primary, border: `2px solid ${colors.primary}` }} onClick={handleMerch}>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag size={28} style={{ color: colors.primary }} />
                <h3 className="font-orbitron text-lg font-bold" style={{ color: colors.text }}>Featured Merch</h3>
              </div>
              <div className="flex flex-col items-center gap-4">
                <img src={pick.img} alt={pick.name} className="w-32 h-32 rounded-lg border" style={{ borderColor: colors.primary }} />
                <div className="text-center">
                  <div className="font-orbitron font-bold text-lg" style={{ color: colors.text }}>{pick.name}</div>
                  <div className="text-sm font-semibold mt-1" style={{ color: colors.primary }}>{pick.price}</div>
                  <p className="text-xs mt-3" style={{ color: colors.textMuted }}>Click to browse all merch →</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Box 3: Subscription Tiers */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" style={{ backgroundColor: colors.surface, borderColor: colors.primary, border: `2px solid ${colors.primary}` }} onClick={handleSubscribe}>
            <CardContent className="p-8">
              <h3 className="font-orbitron text-lg font-bold mb-6 text-center" style={{ color: colors.text }}>Support SSR</h3>
              <div className="space-y-3">
                {SUBSCRIPTION_TIERS.map((tier, idx) => {
                  const Icon = tier.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg transition-colors" style={{ backgroundColor: `${colors.primary}10` }}>
                      <Icon size={20} style={{ color: colors.primary }} />
                      <div className="flex-1">
                        <div className="font-orbitron font-bold text-sm" style={{ color: colors.text }}>{tier.name}</div>
                        <div className="text-xs" style={{ color: colors.textMuted }}>{tier.price}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-center mt-4" style={{ color: colors.textMuted }}>Click to view all features →</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
