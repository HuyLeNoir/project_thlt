export interface OpenedFile {
  id: string
  fileName: string
  isDirty?: boolean // True nếu file chưa được lưu
  content: string
}

export interface SearchOption {
  isCaseSensitive: boolean
  isWholeWord: boolean
  isRegex: boolean
}
export interface MatchItem {
  line: number
  text: React.ReactElement
}
export interface FileSearchResult {
  fileId: string
  fileName: string // Tên file
  matchCount: number // Số match
  matches: MatchItem[]
}
