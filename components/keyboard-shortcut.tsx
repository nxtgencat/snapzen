import { Badge } from "@/components/ui/badge"

interface KeyboardShortcutProps {
  keys: string[]
  label: string
}

export function KeyboardShortcut({ keys, label }: KeyboardShortcutProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <div key={index} className="flex items-center">
            <Badge
              variant="outline"
              className="px-2 py-1 rounded-md font-mono bg-muted border-border dark:bg-muted dark:border-muted-foreground/30"
            >
              {key}
            </Badge>
            {index < keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

