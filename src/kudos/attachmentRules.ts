export const MAX_ATTACHMENTS = 5
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024

export function validateAttachments(files: File[]): string | null {
  if (files.length > MAX_ATTACHMENTS) {
    return `Un Kudo admite máximo ${MAX_ATTACHMENTS} adjuntos`
  }
  if (files.some((file) => !(file.type.startsWith('image/') || file.type === 'application/pdf'))) {
    return 'Solo se admiten imágenes y PDF'
  }
  const total = files.reduce((sum, file) => sum + file.size, 0)
  if (total > MAX_TOTAL_BYTES) {
    return `Los adjuntos no pueden superar ${MAX_TOTAL_BYTES / 1024 / 1024} MB en total`
  }
  return null
}
