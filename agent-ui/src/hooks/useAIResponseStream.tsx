import { useCallback } from 'react'
import { type RunResponse } from '@/types/playground'

/**
 * Parses SSE (Server-Sent Events) formatted data from the buffer.
 * SSE format:
 *   event: EventName
 *   data: {"json": "payload"}
 *
 * Events are separated by double newlines.
 */
function parseSSEBuffer(
  buffer: string,
  onChunk: (chunk: RunResponse) => void
): string {
  // SSE events are separated by double newlines
  const eventDelimiter = '\n\n'
  let delimiterIndex = buffer.indexOf(eventDelimiter)

  while (delimiterIndex !== -1) {
    const eventBlock = buffer.slice(0, delimiterIndex)
    buffer = buffer.slice(delimiterIndex + eventDelimiter.length)

    // Parse the event block - look for "data:" line
    const lines = eventBlock.split('\n')
    let jsonData: string | null = null

    for (const line of lines) {
      if (line.startsWith('data:')) {
        // Extract JSON after "data:" prefix
        jsonData = line.slice(5).trim()
        break
      }
    }

    if (jsonData) {
      try {
        const parsed = JSON.parse(jsonData) as RunResponse
        onChunk(parsed)
      } catch {
        // Invalid JSON - skip this event
        console.warn('Failed to parse SSE data:', jsonData)
      }
    }

    delimiterIndex = buffer.indexOf(eventDelimiter)
  }

  return buffer
}

interface StreamOptions {
  apiUrl: string
  headers?: Record<string, string>
  requestBody: FormData | Record<string, unknown>
  onChunk: (chunk: RunResponse) => void
  onError: (error: Error) => void
  onComplete: () => void
}

/**
 * Hook to handle streaming API responses as JSON objects.
 * Accumulates partial JSON data and extracts complete objects incrementally.
 */
export default function useAIResponseStream() {
  const streamResponse = useCallback(async (options: StreamOptions) => {
    const {
      apiUrl,
      headers = {},
      requestBody,
      onChunk,
      onError,
      onComplete
    } = options

    let buffer = ''

    try {
      const isFormData = requestBody instanceof FormData
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          ...(!isFormData && { 'Content-Type': 'application/json' }),
          ...headers
        },
        body: isFormData ? requestBody : JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw errorData
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // Process stream iteratively (avoid deep recursion)
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          parseSSEBuffer(buffer, onChunk)
          onComplete()
          return
        }

        buffer += decoder.decode(value, { stream: true })
        buffer = parseSSEBuffer(buffer, onChunk)
      }
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'detail' in error
          ? String((error as { detail: unknown }).detail)
          : String(error)
      onError(new Error(message))
    }
  }, [])

  return { streamResponse }
}
