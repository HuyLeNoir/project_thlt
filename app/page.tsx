"use client"
import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TextEditor } from "@/components/ui/texteditor"
import { ButtonWithTooltip } from "@/components/ui/buttonWithTooltip"

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
  FolderOpen,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OpenedFile, SearchOption, FileSearchResult } from "@/lib/definitions"
import { appendFiles } from "@/lib/utilities"
import { cn } from "@/lib/utils"
import { RegReplace, RegexSearch, getRegex } from "@/lib/regexEngine"
import { EmptyOutline } from "@/components/emptyTextEditor"

export default function Page() {
  const [isSearching, setIsSearching] = useState(false)
  const [jumpRequest, setJumpRequest] = useState(0)
  const [target, setTarget] = useState("")
  const [replaceTarget, setReplaceTarget] = useState("")
  const [searchOption, setSearchOption] = useState<SearchOption>({
    isCaseSensitive: false,
    isRegex: false,
    isWholeWord: false,
  })
  const [files, setFiles] = useState<OpenedFile[]>([])
  const [activeTab, setActiveTab] = useState(files[0]?.id)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isOpen, setIsOpen] = useState<Record<number, boolean>>({})
  const [error, setError] = useState("")
  const [regexSearchResult, setRegexSearchResult] = useState<
    FileSearchResult[]
  >([]) //sidebar search on all files
  const [jumpLocation, setJumpLocation] = useState<{
    fileId: string
    line: number
  } | null>(null)

  useEffect(() => {
    //useEffect cap nhat lai sideBar
    try {
      const result = RegexSearch(searchOption, target, files)
      setRegexSearchResult(result)
      setError("") // Reset lỗi cũ nếu tìm thành công
    } catch (err: any) {
      setError(err.message)
    }
  }, [searchOption, files, target])

  function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.target.value
    setTarget(target)
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
    // const result = RegexSearch(searchOption, target, files)
    // setRegexSearchResult(result)
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
    if (!event.target.files || event.target.files.length === 0) return
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
  function handleNewFile() {
    const newFile: OpenedFile = {
      id: `${Date.now()}TextDocument${Math.random()}`,
      fileName: "New txt document",
      content: "",
      isDirty: false,
    }
    setFiles((prevFiles) => [newFile, ...prevFiles])
    setActiveTab(newFile.id)
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

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Icon */}
      <div className="flex min-w-40 items-center gap-2.5">
        <Regex
          size={48}
          className="rounded-md bg-emerald-50 p-2 text-primary"
        />
        <p className="font-k2d text-lg font-bold">Project THLT</p>
      </div>
      {/* {BODY} */}
      <div className="flex min-h-0 w-full flex-1 flex-col gap-3">
        {/* controlbar */}
        {/* Menu */}
        <div className="flex w-full flex-row border-t border-b px-2.5 py-1">
          <input
            type="file"
            accept=".txt"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <ButtonWithTooltip
            variant="ghost"
            size="icon-lg"
            label="Tạo file"
            onClick={handleNewFile}
          >
            <File data-icon="inline-start" />
          </ButtonWithTooltip>
          <ButtonWithTooltip
            variant="ghost"
            size="icon-lg"
            label="Mở file"
            onClick={handleUpload}
          >
            <FolderOpen data-icon="inline-start" />
          </ButtonWithTooltip>
          <ButtonWithTooltip
            variant="ghost"
            size="icon-lg"
            label="Lưu file"
            onClick={handleSaveFile}
          >
            <Save data-icon="inline-start" />
          </ButtonWithTooltip>
          <ButtonWithTooltip
            variant="ghost"
            size="icon-lg"
            label="Tìm kiếm"
            onClick={() => {
              setIsSearching(!isSearching)
            }}
          >
            <Search data-icon="inline-start" />
          </ButtonWithTooltip>
        </div>
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-row gap-2.5">
          {/* Sidebar */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ x: "-100%", width: 0, opacity: 0 }}
                animate={{ x: 0, width: "25%", opacity: 1 }}
                exit={{ x: "-100%", width: 0, opacity: 0 }}
                transition={{ ease: "easeOut", duration: 0.2 }}
                className="ml-2.5 flex h-full w-[25%] flex-col"
              >
                {/* Search */}
                <div className="flex rounded-sm border px-2 py-1 focus-within:outline-2 focus-within:outline-primary focus-within:outline-solid">
                  <input
                    type="text"
                    value={target}
                    onChange={handleTargetChange}
                    className="w-full text-sm outline-none"
                    placeholder="Search"
                  />
                  {/* Search option */}
                  <div className="flex gap-1">
                    <ButtonWithTooltip
                      label="Phân biệt chữ hoa"
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
                    </ButtonWithTooltip>
                    <ButtonWithTooltip
                      label="Toàn bộ từ"
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
                    </ButtonWithTooltip>
                    <ButtonWithTooltip
                      label="Sử dụng biểu thức chính quy"
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
                    </ButtonWithTooltip>
                  </div>
                </div>
                {error && (
                  <p className="mt-1 text-xs text-destructive">{error}</p>
                )}
                {/* Replace */}

                <div className="flex items-center gap-1 py-1">
                  <input
                    value={replaceTarget}
                    onChange={(e) => {
                      setReplaceTarget(e.target.value)
                    }}
                    type="text"
                    className="w-full rounded-sm border px-2 py-2.5 text-sm focus:outline-primary"
                    placeholder="Replace"
                  />

                  <ButtonWithTooltip
                    label="Thay thế"
                    onClick={handleReplace}
                    variant={"outline"}
                    size={"icon-lg"}
                  >
                    <Replace />
                  </ButtonWithTooltip>
                  <ButtonWithTooltip
                    label="Thay thế toàn bộ"
                    onClick={handleReplaceAll}
                    variant={"outline"}
                    size={"icon-lg"}
                  >
                    <ReplaceAll />
                  </ButtonWithTooltip>
                </div>
                {/* result */}

                {target && (
                  <div className="mt-2.5 flex min-h-0 max-w-full flex-1 flex-col border-t px-2 py-2">
                    <p className="py-2 text-sm font-bold text-muted-foreground">
                      Kết quả tìm kiếm
                    </p>
                    {/* Result */}
                    {/* ACcordion */}
                    <div className="flex h-full min-h-0 flex-1 scrollbar-thin flex-col gap-0.5 overflow-y-auto">
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
                                    <Badge variant={"outline"}>
                                      {match.line}
                                    </Badge>
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
              </motion.div>
            )}
          </AnimatePresence>
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
              className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-0"
            >
              {/* Tab head */}
              <div className="w-full min-w-0 scrollbar-thin overflow-x-auto overflow-y-hidden rounded-t-md bg-gray-100">
                <TabsList className="inline-flex h-auto w-max flex-nowrap justify-start bg-gray-100 p-0">
                  {files.map((file) => (
                    <TabsTrigger
                      key={file.id}
                      value={file.id}
                      className="group shrink-0 justify-between py-0 not-data-active:hover:bg-gray-200"
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
                          "invisible flex h-5 w-5 items-center justify-center rounded-full p-0 transition-all duration-100 ease-in group-hover:visible",
                          activeTab != file.id
                            ? "hover:bg-secondary hover:brightness-90"
                            : "visible hover:bg-primary hover:brightness-90"
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
              </div>
              {files.map(
                (file) =>
                  file.id == activeTab && (
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
                        jumpToLine={
                          jumpLocation?.fileId === file.id
                            ? jumpLocation.line
                            : null
                        }
                      ></TextEditor>
                    </TabsContent>
                  )
              )}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
