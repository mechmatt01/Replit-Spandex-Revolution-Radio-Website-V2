import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ShoppingBag, PackageSearch } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const PRODUCTS = [
  { id:'p1', name:'SSR Neon Tee', price:'$28', img:'https://picsum.photos/seed/tee/200', url:'#' },
  { id:'p2', name:'SSR Chrome Sticker', price:'$6', img:'https://picsum.photos/seed/sticker/200', url:'#' },
  { id:'p3', name:'SSR Trucker Hat', price:'$24', img:'https://picsum.photos/seed/hat/200', url:'#' },
  { id:'p4', name:'SSR Patch Set', price:'$12', img:'https://picsum.photos/seed/patch/200', url:'#' },
];

export default function Overview3() {
  const { getColors } = useTheme();
  const colors = getColors();
  const pick = React.useMemo(()=> PRODUCTS[Math.floor(Math.random()*PRODUCTS.length)], []);

  return (
    <section id="overview" className="py-16" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-8" style={{ color: colors.text }}>
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box 1: Join / Sign Up */}
          <Card className="shadow-none" style={{ backgroundColor: colors.surface, borderColor: colors.primary }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <UserPlus style={{ color: colors.primary }} />
                <h3 className="text-xl font-semibold" style={{ color: colors.text }}>Join Spandex Salvation</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>Sign up to unlock themes, chat, and submissions.</p>
              <Button variant="default" style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}>
                Sign Up / Log In
              </Button>
            </CardContent>
          </Card>

          {/* Box 2: Product Showcase */}
          <Card className="shadow-none" style={{ backgroundColor: colors.surface, borderColor: colors.primary }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <PackageSearch style={{ color: colors.primary }} />
                <h3 className="text-xl font-semibold" style={{ color: colors.text }}>Featured Product</h3>
              </div>
              <div className="flex gap-3 items-center">
                <img src={pick.img} alt={pick.name} className="w-20 h-20 rounded-lg border" style={{ borderColor: colors.primary }} />
                <div>
                  <div className="font-medium" style={{ color: colors.text }}>{pick.name}</div>
                  <div className="text-sm" style={{ color: colors.textMuted }}>{pick.price}</div>
                  <Button variant="ghost" className="mt-2" style={{ color: colors.primary }}>View</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Box 3: Merch */}
          <Card className="shadow-none" style={{ backgroundColor: colors.surface, borderColor: colors.primary }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingBag style={{ color: colors.primary }} />
                <h3 className="text-xl font-semibold" style={{ color: colors.text }}>Merch</h3>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: colors.text }}>
                <li className="flex justify-between"><span>Tour Poster</span><span style={{ color: colors.textMuted }}>$15</span></li>
                <li className="flex justify-between"><span>Cassette Mixtape Vol.1</span><span style={{ color: colors.textMuted }}>$10</span></li>
                <li className="flex justify-between"><span>Guitar Pick Pack</span><span style={{ color: colors.textMuted }}>$5</span></li>
              </ul>
              <Button variant="ghost" className="mt-2" style={{ color: colors.primary }}>View Merch</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
