import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-cyber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-cyber border border-primary/20 hover:shadow-pulse",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg shadow-neon border border-destructive/20",
        outline:
          "border border-primary/30 bg-card/50 text-foreground hover:bg-primary/10 hover:border-primary/60 rounded-lg shadow-glow backdrop-blur-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg shadow-neon border border-secondary/20 hover:shadow-pulse",
        ghost: "hover:bg-primary/10 hover:text-primary rounded-lg transition-neon",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow transition-cyber",
        cyber: "bg-gradient-cyber text-foreground hover:shadow-cyber rounded-lg border border-primary/30 animate-neon-pulse font-bold",
        neon: "bg-gradient-neon text-foreground hover:shadow-neon rounded-lg border border-secondary/30 transition-glow",
        mesh: "bg-gradient-mesh text-foreground hover:shadow-glow rounded-lg border border-accent/30",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-md px-4",
        lg: "h-16 rounded-lg px-10 text-lg font-semibold",
        icon: "h-12 w-12 rounded-lg",
        hero: "h-20 rounded-lg px-12 text-xl font-bold shadow-cyber",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
