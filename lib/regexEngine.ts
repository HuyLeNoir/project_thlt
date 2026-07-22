import {
  SearchOption,
  FileSearchResult,
  OpenedFile,
  MatchItem,
} from "@/lib/definitions"
import React from "react"

export function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function RegexSearch(
  option: SearchOption,
  target: string,
  files: OpenedFile[]
): FileSearchResult[] {
  if (!target || target.trim() === "") return []

  const results: FileSearchResult[] = []

  let pattern = option.isRegex ? target : escapeRegex(target)

  if (option.isWholeWord) {
    pattern = `\\b${pattern}\\b`
  }

  let regex: RegExp
  try {
    const flags = option.isCaseSensitive ? "g" : "gi"
    regex = new RegExp(pattern, flags)
  } catch (error: any) {
    throw new Error(error.message)
  }

  files.forEach((file) => {
    const lines = file.content.split("\n")
    const fileMatches: MatchItem[] = []

    lines.forEach((lineText, index) => {
      regex.lastIndex = 0

      if (regex.test(lineText)) {
        regex.lastIndex = 0

        const parts = lineText.split(regex)
        const matchedKeywords = lineText.match(regex) || []

        // 💡 Dùng React.createElement để tạo JSX Element trong file .ts
        const children: React.ReactNode[] = []

        parts.forEach((part, pIdx) => {
          children.push(part)
          // Thêm thẻ <mark> highlight nếu còn từ khóa khớp
          if (pIdx < matchedKeywords.length) {
            children.push(
              React.createElement(
                "mark",
                {
                  key: pIdx,
                  className: "inline-block rounded-sm bg-amber-300 px-0.5",
                },
                matchedKeywords[pIdx]
              )
            )
          }
        })

        const highlightedText = React.createElement(
          "p",
          { className: "truncate font-mono text-slate-700" },
          ...children
        )

        fileMatches.push({
          line: index + 1,
          text: highlightedText, // Khớp với interface MatchItem
        })
      }
    })

    if (fileMatches.length > 0) {
      results.push({
        fileId: file.id,
        fileName: file.fileName,
        matchCount: fileMatches.length,
        matches: fileMatches,
      })
    }
  })
  return results
}
