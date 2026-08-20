import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))

type Props = {
  value: string
  onChange: (value: string) => void
}

export function HourSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-[80px]">
        <SelectValue>{value}시</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {HOURS.map((h) => (
          <SelectItem key={h} value={h}>
            {h}시
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
