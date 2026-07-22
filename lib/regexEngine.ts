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
export function getRegex(option: SearchOption, keyword: string): RegExp {
  if (!keyword || keyword.trim() === "") throw new Error("Không có keywword")
  let basePattern = option.isRegex ? keyword : escapeRegex(keyword)

  if (option.isWholeWord) {
    const startsWithWord = /^\w/.test(keyword) //lay ky tu dau tien cua keyword
    const endsWithWord = /\w$/.test(keyword) //lay ky tu cuoi cung cua keyword

    const left = startsWithWord ? "\\b" : "(?<=^|\\W)"
    const right = endsWithWord ? "\\b" : "(?=$|\\W)"

    basePattern = `${left}${basePattern}${right}`
  }

  try {
    const flags = option.isCaseSensitive ? "g" : "gi"
    return new RegExp(`(${basePattern})`, flags)
  } catch (error: any) {
    throw new Error(error.message)
  }
}
export function RegexSearch(
  option: SearchOption,
  target: string,
  files: OpenedFile[]
): FileSearchResult[] {
  if (!target || target.trim() === "") return []

  const results: FileSearchResult[] = []
  const regex = getRegex(option, target) //split with group lol
  // let pattern = option.isRegex ? target : escapeRegex(target)

  // if (option.isWholeWord) {
  //   pattern = `\\b${pattern}\\b`
  // }

  // let regex: RegExp
  // try {
  //   const flags = option.isCaseSensitive ? "g" : "gi"
  //   regex = new RegExp(pattern, flags)
  // } catch (error: any) {
  //   throw new Error(error.message)
  // }

  files.forEach((file) => {
    const lines = file.content.split("\n")
    const fileMatches: MatchItem[] = []

    lines.forEach((lineText, index) => {
      // const parts = lineText.split(regex)
      let match: RegExpExecArray | null
      while ((match = regex.exec(lineText)) !== null) {
        //match tu biet cach nhảy index qua match kế tiep
        const matchIndex = match.index // Vị trí bắt đầu của match này
        const matchLength = match[0].length // Độ dài của chuỗi khớp
        const before = lineText.slice(Math.max(0, matchIndex - 10), matchIndex)
        const matchedText = match[0]
        const after = lineText.slice(matchIndex + matchLength)
        //add vao accordion voi moi match
        const highlightedText = React.createElement(
          "p",
          { className: "truncate text-xs" },
          before,
          React.createElement(
            "mark",
            {
              key: "active-mark",
              className: "rounded-xs bg-amber-300 px-0.5",
            },
            matchedText
          ),
          after
        )
        fileMatches.push({
          line: index + 1,
          text: highlightedText, // Khớp với interface MatchItem
        })
      }
      // parts.forEach((part, pIdx) => {
      //   if (!part) return
      //   if (pIdx % 2 === 1) {
      //     children.push(
      //       React.createElement(
      //         "mark",
      //         {
      //           key: pIdx,
      //           className: "inline-block rounded-sm bg-amber-300 px-0.5",
      //         },
      //         part
      //       )
      //     )
      //   } else {
      //     children.push(part)
      //   }
      // })
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
//replace keyword to target with mode='all', 'single'
//this function is meant to replace file.content with current active tab
export function RegReplace(
  option: SearchOption,
  mode: "single" | "all",
  keyword: string,
  target: string,
  content: string
) {
  if (!keyword || !mode || !target || !content || !option) return content
  try {
    let regex = getRegex(option, keyword) //always have global flag
    if (mode === "single") {
      const newFlags = regex.flags.replace("g", "") //replace mustn't contain g flag
      regex = RegExp(regex.source, newFlags)
      return content.replace(regex, target)
    } else if (mode === "all") {
      return content.replaceAll(regex, target)
    }
  } catch (err: any) {
    return content
  }
}
