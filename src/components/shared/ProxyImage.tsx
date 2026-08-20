import { toast } from "sonner"
import { imageProxyUrl, copyImagePath } from "@/lib/imageProxy"
import { cn } from "@/lib/utils"

type Props = {
  path: string | null | undefined
  label: string
  className?: string
}

export function ProxyImage({ path, label, className }: Props) {
  const src = imageProxyUrl(path)

  async function handleClick() {
    const ok = await copyImagePath(path)
    if (ok) toast.success("이미지 경로가 복사되었습니다")
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {src ? (
        <img
          src={src}
          alt={label}
          loading="lazy"
          onClick={handleClick}
          className={cn("cursor-pointer rounded-md border object-cover", className)}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground",
            className,
          )}
        >
          이미지 없음
        </div>
      )}
    </div>
  )
}
