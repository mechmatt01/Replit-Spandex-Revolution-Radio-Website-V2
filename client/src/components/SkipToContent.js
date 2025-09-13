import { jsx as _jsx } from "react/jsx-runtime";
export default function SkipToContent() {
    return (_jsx("a", { href: "#main-content", className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold transition-all", children: "Skip to main content" }));
}
