"use client"

import { useSyncExternalStore, useCallback } from "react"
import { EnrichedChannel } from "@/types/iptv"

const HISTORY_STORAGE_KEY = "pulsetv_watch_history_v1"
const MAX_HISTORY = 12

let cachedRaw: string | null = null
let cachedParsed: EnrichedChannel[] = []
const emptyServerSnapshot: EnrichedChannel[] = []

function getSnapshot(): EnrichedChannel[] {
  if (typeof window === "undefined") return emptyServerSnapshot
  const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
  if (stored !== cachedRaw) {
    cachedRaw = stored
    try {
      cachedParsed = stored ? JSON.parse(stored) : []
    } catch {
      cachedParsed = []
    }
  }
  return cachedParsed
}

function getServerSnapshot(): EnrichedChannel[] {
  return emptyServerSnapshot
}

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  const onStorage = (e: StorageEvent) => {
    if (e.key === HISTORY_STORAGE_KEY) {
      callback()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", onStorage)
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function useWatchHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addToHistory = useCallback((channel: EnrichedChannel) => {
    const current = getSnapshot()
    const filtered = current.filter((item) => item.id !== channel.id)
    const updated = [channel, ...filtered].slice(0, MAX_HISTORY)
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error("Failed to save watch history", e)
    }
    notify()
  }, [])

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY)
      cachedRaw = null
      cachedParsed = []
    } catch (e) {
      console.error("Failed to clear watch history", e)
    }
    notify()
  }, [])

  return {
    history,
    addToHistory,
    clearHistory,
  }
}
