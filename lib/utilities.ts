import { OpenedFile } from "./definitions"
export async function appendFiles(
  newFileList: FileList | null,
  currentFiles: OpenedFile[]
): Promise<OpenedFile[]> {
  if (!newFileList || newFileList.length === 0) return currentFiles

  // Chuyển FileList thành Array và đọc từng file
  const filePromises = Array.from(newFileList).map((file) => {
    return new Promise<OpenedFile>((resolve, reject) => {
      const reader = new FileReader()

      // Đọc xong nội dung file dưới dạng Text
      reader.onload = (event) => {
        resolve({
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Tạo id duy nhất
          fileName: file.name,
          content: (event.target?.result as string) || "",
          isDirty: false,
        })
      }

      reader.onerror = (error) => reject(error)

      // Đọc file dạng text (phù hợp với text editor)
      reader.readAsText(file)
    })
  })

  // Đợi đọc xong tất cả file mới
  const loadedFiles = await Promise.all(filePromises)

  // Append file mới vào danh sách hiện tại
  return [...loadedFiles, ...currentFiles]
}
