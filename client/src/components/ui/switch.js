import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";
const Switch = React.forwardRef(({ className, ...props }, ref) => (_jsx(SwitchPrimitives.Root, { className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className), ...props, ref: ref, children: _jsx(SwitchPrimitives.Thumb, { className: cn("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0") }) })));
Switch.displayName = SwitchPrimitives.Root.displayName;
export { Switch };
