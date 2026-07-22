import { FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function EmptyOutline({ onUpload }: { onUpload: () => void }) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderPlus />
        </EmptyMedia>
        <EmptyTitle>Chưa có file được mở</EmptyTitle>
        <EmptyDescription>Mở file để bắt đầu sử dụng công cụ </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onUpload} variant="outline" size="sm">
          Mở file
        </Button>
      </EmptyContent>
    </Empty>
  )
}
