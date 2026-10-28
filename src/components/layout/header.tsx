"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Tv, Star, Search, Flame, Sparkles } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useFavorites } from "@/hooks/use-favorites"

interface HeaderProps {
  favoritesCount?: number
  activeTab?: "discover" | "browse" | "iptvmate" | "xxx" | "nsfw" | "favorites"
  setActiveTab?: (tab: "discover" | "browse" | "iptvmate" | "xxx" | "nsfw" | "favorites") => void
  searchQuery?: string
  setSearchQuery?: (q: string) => void
  totalChannels?: number
}

export function Header({
  favoritesCount: propFavoritesCount,
  activeTab,
  setActiveTab,
  searchQuery: propSearchQuery,
  setSearchQuery,
}: HeaderProps) {
  const router = useRouter()
  const { count: hookFavoritesCount } = useFavorites()
  const favoritesCount = propFavoritesCount ?? hookFavoritesCount

  const [localSearch, setLocalSearch] = useState("")
  const searchQuery = propSearchQuery ?? localSearch

  const handleTabClick = (tab: "discover" | "browse" | "iptvmate" | "xxx" | "nsfw" | "favorites") => {
    if (setActiveTab) {
      setActiveTab(tab)
    } else {
      if (tab === "discover") {
        router.push("/")
      } else {
        router.push(`/?tab=${tab}`)
      }
    }
  }

  const handleSearchChange = (value: string) => {
    if (setSearchQuery) {
      setSearchQuery(value)
      if (setActiveTab && activeTab !== "browse" && value.trim().length > 0) {
        setActiveTab("browse")
      }
    } else {
      setLocalSearch(value)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !setSearchQuery && localSearch.trim()) {
      router.push(`/?tab=browse&query=${encodeURIComponent(localSearch.trim())}`)
    }
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#090a10]/80 backdrop-blur-2xl transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleTabClick("discover")}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white shadow-lg shadow-rose-500/20 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-rose-500/35">
              <Tv className="size-4.5" />
              <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 ring-2 ring-[#090a10]" />
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">
                  Pulse<span className="text-rose-500">TV</span>
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                  LIVE
                </span>
              </div>
              <span className="hidden sm:block text-[10px] tracking-wider text-zinc-400 font-mono -mt-0.5">
                Global Stream Feed
              </span>
            </div>
          </button>

          {/* Navigation Tabs (Sleek Segmented Capsule) */}
          <nav className="hidden md:inline-flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            <button
              onClick={() => handleTabClick("discover")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === "discover"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]"
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => handleTabClick("browse")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === "browse"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]"
              }`}
            >
              Browse All
            </button>
            <button
              onClick={() => handleTabClick("iptvmate")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === "iptvmate"
                  ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-sm shadow-purple-500/30 font-semibold"
                  : "text-zinc-400 hover:text-purple-300 hover:bg-white/[0.05]"
              }`}
            >
              <Sparkles className="size-3.5 text-purple-400 fill-purple-400/20" />
              <span>IPTVMate</span>
              <span className="rounded-full bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-bold text-purple-200 border border-purple-500/30">
                M3U
              </span>
            </button>
            <button
              onClick={() => handleTabClick("nsfw")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === "nsfw" || activeTab === "xxx"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-rose-500/30 font-semibold"
                  : "text-zinc-400 hover:text-rose-400 hover:bg-white/[0.05]"
              }`}
            >
              <Flame className="size-3.5 text-rose-500 fill-rose-500/20" />
              <span>NSFW</span>
              <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                18+
              </span>
            </button>
            <button
              onClick={() => handleTabClick("favorites")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === "favorites"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]"
              }`}
            >
              <Star
                className={`size-3.5 ${
                  favoritesCount > 0
                    ? "text-amber-400 fill-amber-400"
                    : activeTab === "favorites"
                    ? "text-zinc-950"
                    : "text-zinc-400"
                }`}
              />
              <span>Favorites</span>
              {favoritesCount > 0 && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activeTab === "favorites"
                      ? "bg-zinc-950 text-white"
                      : "bg-white/15 text-zinc-200"
                  }`}
                >
                  {favoritesCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Spotlight Search Pill */}
          <div className="relative w-44 sm:w-64 md:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search 10,000+ channels..."
              className="h-9 w-full rounded-full border border-white/[0.08] bg-white/[0.04] pl-9.5 pr-8 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-4 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[9px] font-medium text-zinc-500">
                /
              </kbd>
            )}
          </div>

          {/* Quick IPTVMate on mobile */}
          <button
            onClick={() => handleTabClick("iptvmate")}
            className={`md:hidden relative flex size-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:text-purple-400 cursor-pointer transition-colors ${
              activeTab === "iptvmate"
                ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                : ""
            }`}
            title="IPTVMate Live Streams"
          >
            <Sparkles className="size-4 text-purple-400" />
          </button>

          {/* Quick NSFW on mobile */}
          <button
            onClick={() => handleTabClick("nsfw")}
            className={`md:hidden relative flex size-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:text-rose-400 cursor-pointer transition-colors ${
              activeTab === "nsfw" || activeTab === "xxx"
                ? "border-rose-500/50 bg-rose-500/20 text-rose-400"
                : ""
            }`}
            title="NSFW Adult Live Feeds (18+)"
          >
            <Flame className="size-4 text-rose-500" />
          </button>

          {/* Quick Favorites on mobile */}
          <button
            onClick={() => handleTabClick("favorites")}
            className="md:hidden relative flex size-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:text-white cursor-pointer transition-colors"
          >
            <Star
              className={`size-4 ${
                favoritesCount > 0 ? "text-amber-400 fill-amber-400" : ""
              }`}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Mode Toggle */}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
