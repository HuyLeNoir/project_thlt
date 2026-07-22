"use client"
import React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TextEditor } from "@/components/ui/texteditor"
import {
  Search,
  File,
  Save,
  FileText,
  Dot,
  Regex,
  X,
  Replace,
  ReplaceAll,
  CaseSensitive,
  ChevronDown,
  WholeWord,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OpenedFile, SearchOption, FileSearchResult } from "@/lib/definitions"
import { appendFiles } from "@/lib/utilities"
import { cn } from "@/lib/utils"
import { RegReplace, RegexSearch, escapeRegex } from "@/lib/regexEngine"
import { EmptyOutline } from "@/components/emptyTextEditor"
export const mockOpenedFiles: OpenedFile[] = [
  {
    id: "App.tsx-1718000000000",
    fileName: "App.tsx",
    isDirty: true,
    content: `import React from 'react';\nimport { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";\n\nexport default function App() {\n  return (\n    <div className="p-4">\n      <h1 className="text-xl font-bold">Code Editor Sandbox</h1>\n    </div>\n  );\n}`,
  },
  {
    id: "styles.css-1718000005000",
    fileName: "styles.css",
    isDirty: false,
    content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n.editor-container {\n  height: 100vh;\n  background-color: #1e1e1e;\n  color: #d4d4d4;\n}`,
  },
  {
    id: "utils.js-1718000010000",
    fileName: "utils.js",
    isDirty: false,
    content: `/**\n * Format string sang slug\n */\nexport function slugify(text) {\n  return text\n    .toString()\n    .toLowerCase()\n    .replace(/\\s+/g, '-')\n    .replace(/[^\\w\\-]+/g, '');\n}`,
  },
  {
    id: "package.json-1718000015000",
    fileName: "package.json",
    isDirty: false,
    content: `{\n  "name": "my-txt-editor",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^18.2.0",\n    "lucide-react": "^0.263.1"\n  }\n}`,
  },
]

export default function Page() {
  const [isSearching, setIsSearching] = useState(false)
  const [jumpRequest, setJumpRequest] = useState(0)
  const [target, setTarget] = useState("")
  const [replaceTarget, setReplaceTarget] = useState("")
  const [searchOption, setSearchOption] = useState<SearchOption>({
    isCaseSensitive: false,
    isRegex: true,
    isWholeWord: false,
  })
  const [files, setFiles] = useState(mockOpenedFiles)
  const [activeTab, setActiveTab] = useState(files[0]?.id)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isOpen, setIsOpen] = useState<Record<number, boolean>>({})
  const [error, setError] = useState("")
  const [regexSearchResult, setRegexSearchResult] = useState<
    FileSearchResult[]
  >([])
  const [jumpLocation, setJumpLocation] = useState<{
    fileId: string
    line: number
  } | null>(null)

  useEffect(() => {
    try {
      const result = RegexSearch(searchOption, target, files)
      setRegexSearchResult(result)
      setError("") // Reset lỗi cũ nếu tìm thành công
    } catch (err: any) {
      setError(err.message)
    }
  }, [searchOption, files])
  function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.target.value
    setTarget(target)
    try {
      const result = RegexSearch(searchOption, target, files)
      setRegexSearchResult(result)
      setError("") // Reset lỗi cũ nếu tìm thành công
    } catch (err: any) {
      setError(err.message)
    }
  }
  function handleReplace() {
    const currentFile = files.find((file) => file.id == activeTab)
    const newFilesContent = RegReplace(
      searchOption,
      "single",
      target,
      replaceTarget,
      currentFile?.content || ""
    )
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === activeTab
          ? {
              ...file,
              content: newFilesContent ?? file.content,
            } // Tạo object file mới với content đã thay thế
          : file
      )
    )
  }
  function handleReplaceAll() {
    const currentFile = files.find((file) => file.id == activeTab)
    const newFilesContent = RegReplace(
      searchOption,
      "all",
      target,
      replaceTarget,
      currentFile?.content || ""
    )
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === activeTab
          ? {
              ...file,
              content: newFilesContent ?? file.content,
            } // Tạo object file mới với content đã thay thế
          : file
      )
    )
  }
  function handleUpload() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(event: any) {
    const updatedFiles = await appendFiles(event.target.files, files)
    setFiles(updatedFiles) // Cập nhật state với danh sách file đã được append
    setActiveTab(updatedFiles[0].id)
    event.target.value = "" // Reset input để có thể chọn lại cùng 1 file nếu muốn
  }
  function handleContentChange(fileId: string, newContent: string) {
    setFiles((prevFiles) =>
      prevFiles.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            content: newContent,
            isDirty: true, // Đánh dấu file đã bị chỉnh sửa
          }
        }
        return file
      })
    )
  }
  function handleSaveFile() {
    const fileToSaveID = activeTab
    const fileToSave = files.find((f) => f.id === fileToSaveID) //lấy ra file cần lưu, là file mà đang active
    if (!fileToSave) return
    const blob = new Blob([fileToSave.content], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileToSave.fileName // Đặt tên file khi tải về
    document.body.appendChild(link)
    link.click()

    // Dọn dẹp URL tạm thời trong bộ nhớ
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    //đánh dấu lại file đã lưu
    setFiles((prevFiles) =>
      prevFiles.map((file) => {
        if (file.id === fileToSaveID) {
          return {
            ...file,
            isDirty: false,
          }
        }
        return file
      })
    )
  }
  function handleCloseFile(e: any, fileId: string) {
    e.stopPropagation() // Ngăn trigger chuyển tab khi bấm icon X

    const remainingFiles = files.filter((f) => f.id !== fileId)
    setFiles(remainingFiles)
    if (activeTab === fileId && remainingFiles.length > 0) {
      const currentIndex = files.findIndex((f) => f.id === fileId)
      // Lấy tab phía trước, hoặc tab đầu tiên nếu đóng tab index 0
      const nextActiveFile = remainingFiles[Math.max(0, currentIndex - 1)]
      setActiveTab(nextActiveFile.id)
    }
  }
  function renderHighlightedContent(
    text: string,
    keyword: string,
    option: SearchOption
  ) {
    const contentToRender = text.endsWith("\n") ? text + "\n" : text
    if (!keyword || keyword.trim() === "") return contentToRender
    let basePattern = option.isRegex ? keyword : escapeRegex(keyword)

    if (option.isWholeWord) {
      const startsWithWord = /^\w/.test(keyword) //lay ky tu dau tien cua keyword
      const endsWithWord = /\w$/.test(keyword) //lay ky tu cuoi cung cua keyword

      const left = startsWithWord ? "\\b" : "(?<=^|\\W)"
      const right = endsWithWord ? "\\b" : "(?=$|\\W)"

      basePattern = `${left}${basePattern}${right}`
    }

    let regex: RegExp
    let matchChecker: RegExp
    try {
      const flags = option.isCaseSensitive ? "g" : "gi"
      const match_flags = option.isCaseSensitive ? "" : "i" //local match for render mark tag
      regex = new RegExp(`(${basePattern})`, flags)
      matchChecker = new RegExp(`^${basePattern}$`, match_flags)
    } catch (error: any) {
      return
    }
    const parts = contentToRender.split(regex)
    return parts.map((part, index) => {
      return matchChecker.test(part) ? (
        <mark key={index} className="rounded-xs bg-amber-300 text-transparent">
          {part}
        </mark>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    })
  }
  return (
    <div className="relative flex h-screen flex-col overflow-hidden p-4">
      {/* Icon */}
      <div className="flex min-w-40 items-center gap-2.5">
        <Regex
          size={48}
          className="rounded-md bg-emerald-50 p-2 text-primary"
        />
        <p className="font-k2d text-lg font-bold">Project THLT</p>
      </div>
      {/* {BODY} */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* controlbar */}
        <div className="flex flex-col gap-2.5">
          {/* Menu */}
          <div className="flex w-full flex-col border-t border-b py-1">
            <div className="w-full">
              <Button variant={"ghost"} onClick={handleUpload} size={"icon-lg"}>
                <File data-icon="inline-start" />
                <input
                  type="file"
                  accept=".txt"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
              </Button>
              <Button
                onClick={handleSaveFile}
                variant={"ghost"}
                size={"icon-lg"}
              >
                <Save data-icon="inline-start" />
              </Button>
              <Button
                onClick={() => {
                  setIsSearching(!isSearching)
                }}
                variant={"ghost"}
                size={"icon-lg"}
              >
                <Search size={48} data-icon="inline-start" />
              </Button>
            </div>
            {isSearching && (
              <div className="mt-2.5 w-full px-30">
                {/* Search */}
                <p className="mt-2.5 text-sm font-bold text-muted-foreground">
                  Từ khoá cần tìm kiếm
                </p>
                <div className="flex rounded-sm border px-2 py-1 focus-within:outline-2 focus-within:outline-primary focus-within:outline-solid">
                  <input
                    type="text"
                    value={target}
                    onChange={handleTargetChange}
                    className="w-full px-2 text-sm outline-none"
                    placeholder="Từ khoá tìm kiếm"
                  />
                  {/* Search option */}
                  <div className="flex gap-1">
                    <Button
                      onClick={() => {
                        setSearchOption({
                          ...searchOption,
                          isCaseSensitive: !searchOption.isCaseSensitive,
                        })
                      }}
                      variant={
                        searchOption.isCaseSensitive ? "default" : "outline"
                      }
                      size={"icon-sm"}
                    >
                      <CaseSensitive />
                    </Button>
                    <Button
                      onClick={() => {
                        setSearchOption({
                          ...searchOption,
                          isWholeWord: !searchOption.isWholeWord,
                        })
                      }}
                      variant={searchOption.isWholeWord ? "default" : "outline"}
                      size={"icon-sm"}
                    >
                      <WholeWord />
                    </Button>
                    <Button
                      onClick={() => {
                        setSearchOption({
                          ...searchOption,
                          isRegex: !searchOption.isRegex,
                        })
                      }}
                      variant={searchOption.isRegex ? "default" : "outline"}

                      size={"icon-sm"}
                    >
                      <Regex />
                    </Button>
                  </div>
                </div>
                {error && (
                  <p className="mt-1 text-xs text-destructive">{error}</p>
                )}
                {/* Replace */}
                <p className="mt-5 text-sm font-bold text-muted-foreground">
                  Thay thế bằng
                </p>
                <div className="flex items-center gap-1 py-1">
                  <input
                    value={replaceTarget}
                    onChange={(e) => {
                      setReplaceTarget(e.target.value)
                    }}
                    type="text"
                    className="w-full rounded-sm border px-2 py-2.5 text-sm focus:outline-primary"
                    placeholder="Từ khoá tìm kiếm"
                  />

                  <Button
                    onClick={handleReplace}
                    variant={"outline"}
                    size={"icon-lg"}
                  >
                    <Replace />
                  </Button>
                  <Button
                    onClick={handleReplaceAll}
                    variant={"outline"}
                    size={"icon-lg"}
                  >
                    <ReplaceAll />
                  </Button>
                </div>
                {/* result */}

                {target && (
                  <div className="mt-5 max-w-full scrollbar-thin overflow-y-auto border-t py-2">
                    <p className="text-sm font-bold text-muted-foreground">
                      Kết quả tìm kiếm
                    </p>
                    {/* Result */}
                    {/* ACcordion */}
                    <div className="flex flex-col gap-0.5">
                      {/* Accordion item*/}

                      {regexSearchResult.length === 0 ? (
                        <div className="flex w-full justify-center py-5">
                          Kết quả tìm kiếm rỗng
                        </div>
                      ) : (
                        regexSearchResult.map((item, index) => (
                          <div key={index}>
                            {/* ACcordion Trigger */}
                            <div
                              onClick={() => {
                                setIsOpen((prev) => ({
                                  ...prev,
                                  [index]: !prev[index],
                                }))
                              }}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg p-2 hover:bg-emerald-50",
                                isOpen[index] ? "" : "shadow-sm"
                              )}
                            >
                              <div className="flex items-center gap-2.5">
                                <FileText
                                  className="text-primary"
                                  size={18}
                                ></FileText>
                                <p>{item.fileName}</p>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <Badge>{item.matchCount} kết quả khớp</Badge>
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 text-slate-400 transition-transform duration-200 data-[state=closed]:-rotate-90"
                                  )}
                                  data-state={isOpen[index] ? "open" : "closed"}
                                />
                              </div>
                            </div>
                            {/* Accordion content */}
                            {isOpen[index] && (
                              <div className="flex flex-col items-start gap-1.5">
                                {item.matches.map((match, match_index) => (
                                  <div
                                    key={match_index}
                                    onClick={() => {
                                      setActiveTab(item.fileId)
                                      setJumpLocation({
                                        fileId: item.fileId,
                                        line: match.line,
                                      })
                                      setJumpRequest((value) => value + 1)
                                    }}
                                    className={cn(
                                      "flex w-full cursor-pointer items-center gap-2.5 py-2 hover:bg-muted"
                                    )}
                                  >
                                    <Badge>Dòng {match.line}</Badge>
                                    {match.text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* TextEditor */}
        {files.length == 0 ? (
          <div className="flex min-h-0 w-full flex-1">
            <EmptyOutline onUpload={handleUpload} />
          </div>
        ) : (
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 w-full flex-1 flex-col gap-0"
          >
            {/* Tab head */}
            <TabsList className={"ml-15 p-0"}>
              {files.map((file) => (
                <TabsTrigger
                  key={file.id}
                  value={file.id}
                  className={"group min-w-40 justify-between"}
                >
                  {file.isDirty && (
                    <span className="h-4 w-4 p-0">
                      <Dot strokeWidth={10} />
                    </span>
                  )}
                  <span className="flex-1 truncate text-left">
                    {file.fileName}
                  </span>
                  <div
                    className={cn(
                      "hidden h-5 w-5 items-center justify-center rounded-full p-0 transition-all duration-100 ease-in group-hover:flex",
                      activeTab != file.id
                        ? "hover:bg-secondary hover:brightness-90"
                        : "flex hover:bg-primary hover:brightness-90"
                    )}
                    onClick={(e) => {
                      e.stopPropagation() // Không kích hoạt chuyển tab
                      handleCloseFile(e, file.id)
                    }}
                  >
                    <X />
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {files.map((file) => (
              <TabsContent
                key={file.id}
                value={file.id}
                className="m-0 overflow-hidden p-0"
              >
                <TextEditor
                  jumpRequest={jumpRequest}
                  file={file}
                  onContentChange={handleContentChange}
                  searchOption={searchOption}
                  target={target}
                  renderHighlightedContent={renderHighlightedContent}
                  jumpToLine={
                    jumpLocation?.fileId === file.id ? jumpLocation.line : null
                  }
                ></TextEditor>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
}
