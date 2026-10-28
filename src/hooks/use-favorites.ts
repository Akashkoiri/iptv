"use client"

import { useSyncExternalStore, useCallback } from "react"

const FAVORITES_STORAGE_KEY = "pulsetv_favorites_v1"

let cachedRaw: string | null = null
let cachedParsed: string[] = []
const emptyServerSnapshot: string[] = []

function getSnapshot(): string[] {
  if (typeof window === "undefined") return emptyServerSnapshot
  const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
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

function getServerSnapshot(): string[] {
  return emptyServerSnapshot
}

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  const onStorage = (e: StorageEvent) => {
    if (e.key === FAVORITES_STORAGE_KEY) {
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

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleFavorite = useCallback((channelId: string) => {
    const current = getSnapshot()
    let updated: string[]
    if (current.includes(channelId)) {
      updated = current.filter((id) => id !== channelId)
    } else {
      updated = [...current, channelId]
    }
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error("Failed to save favorites", e)
    }
    notify()
  }, [])

  const isFavorite = useCallback(
    (channelId: string) => {
      return favorites.includes(channelId)
    },
    [favorites]
  )

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoaded: true,
    count: favorites.length,
  }
}
