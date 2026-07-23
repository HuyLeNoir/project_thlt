import { useEffect, useRef } from "react"
import React from "react"
import { OpenedFile, SearchOption } from "@/lib/definitions"
import { getRegex } from "@/lib/regexEngine"
interface CodeEditorTabProps {
  file: OpenedFile
  target: string
  searchOption: SearchOption
  onContentChange: (id: string, content: string) => void
  jumpToLine: number | null
  jumpRequest: number
}

export function TextEditor({
  file,
  target,
  searchOption,
  onContentChange,
  jumpToLine,
  jumpRequest,
}: CodeEditorTabProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  function renderHighlightedContent(
    text: string,
    keyword: string,
    option: SearchOption
  ) {
    const contentToRender = text.endsWith("\n") ? text + "\n" : text
    try {
      const regex = getRegex(option, keyword)
      const matchChecker = new RegExp(
        regex.source,
        regex.flags.replace(/g/, "")
      ) //loai bo global flag de check local
      const parts = contentToRender.split(regex)
      return parts.map((part, index) => {
        return matchChecker.test(part) ? (
          <mark
            key={index}
            className="rounded-xs bg-amber-300 text-transparent"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      })
    } catch (error: any) {
      return
    }
  }
  function syncScroll(scrollTop: number, scrollLeft: number) {
    const textarea = textareaRef.current
    const horizontalScrollbarHeight = textarea
      ? textarea.offsetHeight - textarea.clientHeight
      : 0

    if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = scrollTop
    if (lineNumbersRef.current) {
      lineNumbersRef.current.style.paddingBottom = `calc(0.5rem + ${horizontalScrollbarHeight}px)`
    }
    if (backdropRef.current) {
      backdropRef.current.scrollTop = scrollTop
      backdropRef.current.scrollLeft = scrollLeft
      backdropRef.current.style.paddingBottom = `${horizontalScrollbarHeight}px`
    }
  }
  function handleScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    syncScroll(e.currentTarget.scrollTop, e.currentTarget.scrollLeft)
  }

  useEffect(() => {
    if (!jumpToLine || !textareaRef.current) return

    const textarea = textareaRef.current
    const linesBeforeMatch = textarea.value.split("\n").slice(0, jumpToLine - 1)
    const lineStart =
      linesBeforeMatch.join("\n").length + (jumpToLine > 1 ? 1 : 0)
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 27

    textarea.focus()
    textarea.setSelectionRange(lineStart, lineStart)
    textarea.scrollTop = Math.max(
      0,
      (jumpToLine - 1) * lineHeight - textarea.clientHeight / 2 + lineHeight
    )

    syncScroll(textarea.scrollTop, textarea.scrollLeft)
  }, [jumpRequest, jumpToLine])

  useEffect(() => {
    if (!textareaRef.current) return
    syncScroll(textareaRef.current.scrollTop, textareaRef.current.scrollLeft)
  }, [file.content])
  return (
    <div className="flex h-full overflow-hidden">
      <div
        ref={lineNumbersRef}
        className={
          "flex h-full w-15 flex-col items-end overflow-hidden p-2 font-k2d text-lg leading-7"
        }
      >
        {file.content.split("\n").map((_, i) => (
          <div
            key={i}
            data-state={i + 1 == jumpToLine ? "active" : "none"}
            className="h-7 w-full shrink-0 text-right text-muted-foreground data-[state=active]:bg-emerald-50 data-[state=active]:text-primary"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="relative h-full w-full border-b bg-secondary p-2">
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 overflow-hidden font-k2d text-lg leading-7 whitespace-pre text-transparent"
        >
          {renderHighlightedContent(file.content, target, searchOption)}
        </div>

        <textarea
          ref={textareaRef}
          value={file.content}
          onScroll={handleScroll}
          onChange={(e) => {
            onContentChange(file.id, e.target.value)
          }}
          spellCheck={false}
          className="absolute inset-2 m-0 resize-none scrollbar-thin overflow-auto border-0 p-0 font-k2d text-lg leading-7 whitespace-pre outline-none"
        />
      </div>
    </div>
  )
}
