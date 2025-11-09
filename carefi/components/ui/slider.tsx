import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, ...props }, ref) => {
  // Determine number of thumbs based on value or defaultValue
  const numThumbs = React.useMemo(() => {
    if (value) return Array.isArray(value) ? value.length : 1
    if (defaultValue) return Array.isArray(defaultValue) ? defaultValue.length : 1
    return 1
  }, [value, defaultValue])

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={value}
      defaultValue={defaultValue}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-900/20">
        <SliderPrimitive.Range className="absolute h-full bg-neutral-900" />
      </SliderPrimitive.Track>
      {Array.from({ length: numThumbs }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-4 w-4 rounded-full border border-neutral-900/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
