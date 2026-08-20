import { useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  id?: string
  className?: string
}

/**
 * 자동완성 입력창. 그냥 `<Input>`이라 직접 타이핑하거나 값을 통째로 붙여넣어도 항상
 * 그대로 동작하고, 그 위에 일치하는 후보를 드롭다운으로만 보여준다. 목록에서 골라야만
 * 검색되는 셀렉트 방식이 아니라 이 방식을 쓴 이유는, LOT 번호처럼 사용자가 다른 곳에서
 * 복사해서 붙여넣는 값은 그 시점의 후보 목록에 없을 수도 있기 때문이다.
 */
export function AutocompleteInput({ value, onChange, suggestions, placeholder, id, className }: Props) {
  const [open, setOpen] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const query = value.trim().toLowerCase()
  // 드롭다운 자체가 max-h-56 overflow-y-auto라서 이미 스크롤되므로 개수를 임의로
  // 자를 필요가 없다 — 예전에 8개로 잘라뒀던 탓에 후보가 많을 때 스크롤할 것도 없이
  // 나머지가 통째로 안 보이는 문제가 있었다.
  const filtered = query ? suggestions.filter((s) => s.toLowerCase().includes(query)) : suggestions

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // 후보 클릭(onMouseDown)이 이 blur보다 먼저 처리되게 살짝 지연한다.
          blurTimeout.current = setTimeout(() => setOpen(false), 150)
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-56 w-full min-w-[180px] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              className={cn(
                "block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted",
                s === value && "bg-muted",
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                clearTimeout(blurTimeout.current)
              }}
              onClick={() => {
                onChange(s)
                setOpen(false)
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
