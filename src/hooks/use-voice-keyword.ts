import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal typings for the Web Speech API, which isn't in TypeScript's DOM lib.
type RecognitionAlternative = { transcript: string }
type RecognitionResult = { isFinal: boolean; 0: RecognitionAlternative; length: number }
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> }
type RecognitionErrorEvent = { error: string }
type Recognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}
type RecognitionCtor = new () => Recognition

export type VoiceState =
  | 'idle'
  | 'requesting'
  | 'listening'
  | 'unsupported'
  | 'denied'
  | 'error'

const errorMessages: Record<string, string> = {
  'not-allowed':
    'Microphone access was blocked. Allow the microphone for this site in your browser settings, then try again.',
  'service-not-allowed':
    'Speech recognition is disabled in this browser. Use the manual SOS button instead.',
  'audio-capture':
    'No microphone was found. Connect a microphone or use the manual SOS button.',
  network:
    'Speech recognition needs a network connection in this browser. Use the manual SOS button while offline.',
}

export function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Listens for a spoken keyword using the browser's speech recognizer.
 * Transcripts are compared in memory and discarded — nothing is recorded,
 * stored, or uploaded by SafeVoice.
 */
export function useVoiceKeyword(keyword: string, onDetected: () => void) {
  const [state, setState] = useState<VoiceState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [heard, setHeard] = useState('')
  const recRef = useRef<Recognition | null>(null)
  const wantRef = useRef(false)
  const keywordRef = useRef(keyword)
  const detectedRef = useRef(onDetected)

  useEffect(() => {
    keywordRef.current = keyword
    detectedRef.current = onDetected
  }, [keyword, onDetected])

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: RecognitionCtor
      webkitSpeechRecognition?: RecognitionCtor
    }
    if (!w.SpeechRecognition && !w.webkitSpeechRecognition) setState('unsupported')
    return () => {
      wantRef.current = false
      recRef.current?.abort()
    }
  }, [])

  const stop = useCallback(() => {
    wantRef.current = false
    recRef.current?.abort()
    recRef.current = null
    setHeard('')
    setState((s) => (s === 'unsupported' ? s : 'idle'))
  }, [])

  const start = useCallback(async () => {
    const w = window as unknown as {
      SpeechRecognition?: RecognitionCtor
      webkitSpeechRecognition?: RecognitionCtor
    }
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!Ctor) {
      setState('unsupported')
      return
    }
    setError(null)
    setState('requesting')
    try {
      // Ask for the microphone explicitly, then release it immediately —
      // the recognizer opens its own stream.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch (err) {
      const name = (err as DOMException)?.name
      setState(name === 'NotAllowedError' ? 'denied' : 'error')
      setError(
        name === 'NotAllowedError'
          ? errorMessages['not-allowed']
          : name === 'NotFoundError'
            ? errorMessages['audio-capture']
            : 'The microphone could not be started. Use the manual SOS button instead.',
      )
      return
    }

    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = navigator.language || 'en-US'
    rec.onresult = (e) => {
      let text = ''
      for (let i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript
      const n = normalize(text)
      setHeard(n.split(' ').slice(-6).join(' '))
      const target = normalize(keywordRef.current)
      if (target && ` ${n} `.includes(` ${target} `)) {
        detectedRef.current()
        // Start a fresh session so the same words don't re-trigger.
        setHeard('')
        rec.abort()
      }
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      wantRef.current = false
      setState(e.error === 'not-allowed' ? 'denied' : 'error')
      setError(errorMessages[e.error] ?? `Voice detection stopped (${e.error}).`)
    }
    rec.onend = () => {
      // Browsers end sessions after silence; resume while the user wants it on.
      if (wantRef.current) {
        try {
          rec.start()
        } catch {
          /* already started */
        }
      }
    }
    recRef.current = rec
    wantRef.current = true
    rec.start()
    setState('listening')
  }, [])

  return { state, error, heard, start, stop }
}
