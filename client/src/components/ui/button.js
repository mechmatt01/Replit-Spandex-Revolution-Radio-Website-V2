import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 hover:shadow-lg active:scale-95", {
    variants: {
        variant: {
            default: "border-0 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:border-2 hover:border-primary hover:glow-primary",
            destructive: "border-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-xl hover:shadow-destructive/30 hover:border-2 hover:border-destructive",
            outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:text-primary hover:shadow-lg hover:shadow-primary/20 hover:border-primary hover:glow-primary",
            secondary: "border-0 bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-lg hover:shadow-primary/20 hover:border-2 hover:border-primary hover:glow-primary",
            ghost: "border-0 bg-transparent hover:border-2 hover:border-primary hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:shadow-primary/10 hover:glow-primary focus:border-2 focus:border-primary",
            link: "text-primary underline-offset-4 hover:underline hover:scale-100 border-0 hover:border-2 hover:border-primary/60 hover:glow-primary focus:border-2 focus:border-primary/60",
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (_jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref: ref, ...props }));
});
Button.displayName = "Button";
export { Button, buttonVariants };
