import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
interface ButtonWithTooltipProps {
  onClick: () => void
  icon?: React.ReactNode
  children: React.ReactNode
  size: "sm" | "default" | "lg" | "icon-sm" | "icon-xs" | "icon-lg" | "xs"
  variant:
    "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
  label: string
  side?: "top" | "right" | "bottom" | "left" // Hướng hiển thị tooltip
}
export function ButtonWithTooltip({
  onClick,
  icon,
  label,
  children,
  size,
  variant,
  side,
}: ButtonWithTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button onClick={onClick} size={size} variant={variant}>
            {children}
          </Button>
        }
      />
      <TooltipContent side={side}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
