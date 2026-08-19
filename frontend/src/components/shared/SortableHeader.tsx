import { ArrowUpDown } from "lucide-react"

type Props = {
  label: string
  onClick: () => void
}

export function SortableHeader({ label, onClick }: Props) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 hover:text-foreground"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </button>
  )
}
