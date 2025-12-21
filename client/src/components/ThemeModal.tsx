import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePremiumTest } from "@/contexts/PremiumTestContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

export default function ThemeModal() {
  const { setCurrentTheme, getColors } = useTheme();
  const { getEffectivePremiumStatus } = usePremiumTest();
  const isPremium = getEffectivePremiumStatus();
  const colors = getColors();

  const setTheme = (t: string) => {
    if ((t==='glam' || t==='rebel' || t==='shredweisen') && !isPremium) {
      alert('Premium required for this theme.');
      return;
    }
    // Map premium placeholders to existing premium theme for now
    const map: Record<string,string> = { glam:'glassmorphism-premium', rebel:'glassmorphism-premium', shredweisen:'glassmorphism-premium' };
    const target = map[t] || (t==='day' ? 'light-mode' : t==='night' ? 'dark-mode' : t);
    setCurrentTheme(target as any);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="ml-2" style={{ color: colors.text }}><Palette size={16} className="mr-2" /> Themes</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Themes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Basic</h4>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setTheme('day')}>Day</Button>
              <Button variant="outline" onClick={()=>setTheme('night')}>Night</Button>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Premium</h4>
            <p className="text-sm opacity-70 mb-2">Requires Premium</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setTheme('glam')}>Glam</Button>
              <Button variant="outline" onClick={()=>setTheme('rebel')}>Rebel</Button>
              <Button variant="outline" onClick={()=>setTheme('shredweisen')}>ShredWeisen</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
