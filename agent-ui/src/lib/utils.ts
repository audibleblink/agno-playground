import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncateText = (text: string, limit: number): string => {
  if (!text) return ''
  return text.length > limit ? `${text.slice(0, limit)}..` : text
}

/** URL pattern for http/https URLs including localhost and IP addresses */
const URL_PATTERN =
  /^https?:\/\/(([\w-]+\.)+[a-z]{2,}|localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?(\/[\w%@_.~+&:-]*)*(\\?[;&\w%@_.,~+&:=-]*)?(#[\w-]*)?$/i

export const isValidUrl = (url: string): boolean => {
  try {
    return URL_PATTERN.test(url.trim())
  } catch {
    return false
  }
}

export const getJsonMarkdown = (content: object = {}): string => {
  try {
    return `\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``
  } catch {
    return `\`\`\`\n${String(content)}\n\`\`\``
  }
}
