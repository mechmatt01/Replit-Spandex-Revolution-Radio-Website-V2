import React from "react";
import { X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function AmpPanel() {
  const [open, setOpen] = React.useState(false);
  const { getColors } = useTheme();
  const colors = getColors();
  return (
    <>
      <button
        onClick={()=>setOpen(true)}
        className="fixed right-3 top-20 z-40 px-2 py-1 rounded border text-sm"
        style={{ background: colors.surface, color: colors.text, borderColor: colors.primary }}
        aria-controls="amp-panel"
        aria-expanded={open}
      >Amp</button>
      {open && (
        <div id="amp-panel" className="fixed right-0 top-0 bottom-0 w-80 z-50 border-l p-4"
             style={{ background: colors.surface, color: colors.text, borderColor: colors.primary }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Amp Panel</h3>
            <button onClick={()=>setOpen(false)} aria-label="Close"><X /></button>
          </div>
          <div className="space-y-3 text-sm opacity-80">
            <label className="flex items-center gap-2"><input type="checkbox" /> Reduce Animations</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Compact UI</label>
          </div>
        </div>
      )}
    </>
  );
}
