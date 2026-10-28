"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
  parseAsStringLiteral,
  throttle,
} from "nuqs"
import { Header } from "@/components/layout/header"
import { HeroSection } from "@/components/home/hero-section"
import { ChannelRow } from "@/components/home/channel-row"
import { CategoryBar, CategoryItem } from "@/components/channels/category-bar"
import { FilterToolbar } from "@/components/channels/filter-toolbar"
import { ChannelCard } from "@/components/channels/channel-card"
import { ChannelListItem } from "@/components/channels/channel-list-item"
import { ChannelModal } from "@/components/channels/channel-modal"
import { useFavorites } from "@/hooks/use-favorites"
import { useWatchHistory } from "@/hooks/use-watch-history"
import { EnrichedChannel, IPTVCountry } from "@/types/iptv"
import {
  Newspaper,
  Trophy,
  Film,
  Music,
  Tv,
  History,
  Star,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Trash2,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdultSection } from "@/components/adult/adult-section"
import { IptvMateSection } from "@/components/iptvmate/iptvmate-section"

interface StreamingAppProps {
  initialFeatured: {
    hero: EnrichedChannel | null
    news: EnrichedChannel[]
    sports: EnrichedChannel[]
    movies: EnrichedChannel[]
    music: EnrichedChannel[]
    animation: EnrichedChannel[]
    xxx: EnrichedChannel[]
    iptvmate?: EnrichedChannel[]
  }
  initialCountries: IPTVCountry[]
  initialChannels: {
    channels: EnrichedChannel[]
    total: number
    page: number
    totalPages: number
  }
  initialCategories?: CategoryItem[]
}

export function StreamingApp({
  initialFeatured,
  initialCountries,
  initialChannels,
  initialCategories,
}: StreamingAppProps) {
  const router = useRouter()

  // Navigation & Search State synchronized with URL using nuqs
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(["discover", "browse", "iptvmate", "xxx", "nsfw", "favorites"] as const).withDefault(
      "discover"
    )
  )
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      limitUrlUpdates: throttle(300),
      history: "replace",
    })
  )
  const [selectedCategory, setSelectedCategory] = useQueryState(
    "category",
    parseAsString.withDefault("all")
  )
  const [selectedCountry, setSelectedCountry] = useQueryState(
    "country",
    parseAsString.withDefault("all")
  )
  const [hasLogoOnly, setHasLogoOnly] = useQueryState(
    "logo",
    parseAsBoolean.withDefault(false)
  )
  const [viewMode, setViewMode] = useQueryState(
    "view",
    parseAsStringLiteral(["grid", "list"] as const).withDefault("grid")
  )
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  )

  const [modalChannelId, setModalChannelId] = useQueryState("modal")

  // Channels Data & Pagination
  const [channels, setChannels] = useState<EnrichedChannel[]>(
    initialChannels.channels
  )
  const [totalCount, setTotalCount] = useState(initialChannels.total)
  const [totalPages, setTotalPages] = useState(initialChannels.totalPages)
  const [isLoading, setIsLoading] = useState(false)

  // Dynamic channel cache for modal deep linking
  const [extraChannels, setExtraChannels] = useState<Record<string, EnrichedChannel>>({})

  // Derive modal channel directly from state/props
  const modalChannel = useMemo(() => {
    if (!modalChannelId) return null
    if (extraChannels[modalChannelId]) return extraChannels[modalChannelId]
    const allKnown = [
      ...(initialFeatured.hero ? [initialFeatured.hero] : []),
      ...initialFeatured.news,
      ...initialFeatured.sports,
      ...initialFeatured.movies,
      ...initialFeatured.music,
      ...initialFeatured.animation,
      ...(initialFeatured.xxx || []),
      ...(initialFeatured.iptvmate || []),
      ...initialChannels.channels,
      ...channels,
    ]
    return allKnown.find((c) => c.id === modalChannelId) || null
  }, [modalChannelId, extraChannels, initialFeatured, initialChannels.channels, channels])

  // Fetch modal channel asynchronously if not found in memory
  useEffect(() => {
    if (!modalChannelId || modalChannel) return

    let isCancelled = false
    fetch(`/api/channel/${encodeURIComponent(modalChannelId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isCancelled && data && !data.error && data.id) {
          setExtraChannels((prev) => ({ ...prev, [data.id]: data }))
        }
      })
      .catch((err) => {
        console.warn("Failed to load modal channel from URL:", err)
      })

    return () => {
      isCancelled = true
    }
  }, [modalChannelId, modalChannel])

  const handleOpenDetails = useCallback(
    (channel: EnrichedChannel) => {
      setExtraChannels((prev) =>
        prev[channel.id] ? prev : { ...prev, [channel.id]: channel }
      )
      setModalChannelId(channel.id)
    },
    [setModalChannelId]
  )

  const handleCloseDetails = useCallback(() => {
    setModalChannelId(null)
  }, [setModalChannelId])

  // Favorites & Watch History
  const { isFavorite, toggleFavorite, count: favoritesCount } = useFavorites()
  const { history, addToHistory, clearHistory } = useWatchHistory()

  // Track last active browse query in sessionStorage so returning from watch always restores filters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search
      if (search) {
        sessionStorage.setItem("iptv_last_browse_query", search)
      }
    }
  }, [activeTab, searchQuery, selectedCategory, selectedCountry, hasLogoOnly, page])

  // Handle playing a channel -> Navigate to dedicated watch player page while preserving filters in URL and session
  const handleSelectChannel = useCallback(
    (channel: EnrichedChannel) => {
      addToHistory(channel)
      let currentSearch = typeof window !== "undefined" ? window.location.search : ""
      if (!currentSearch && typeof window !== "undefined") {
        currentSearch = sessionStorage.getItem("iptv_last_browse_query") || ""
      }
      if (currentSearch && typeof window !== "undefined") {
        sessionStorage.setItem("iptv_last_browse_query", currentSearch)
      }
      const returnParam = currentSearch ? `?from=${encodeURIComponent(currentSearch)}` : ""
      router.push(`/watch/${encodeURIComponent(channel.id)}${returnParam}`)
    },
    [addToHistory, router]
  )

  // Fetch channels when filters or pagination change
  useEffect(() => {
    const controller = new AbortController()

    const fetchFiltered = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery.trim()) params.set("query", searchQuery.trim())
        if (selectedCategory && selectedCategory !== "all") {
          params.set("category", selectedCategory)
        }
        if (selectedCountry && selectedCountry !== "all") {
          params.set("country", selectedCountry)
        }
        if (hasLogoOnly) params.set("hasLogoOnly", "true")
        params.set("page", page.toString())
        params.set("limit", "24")

        const res = await fetch(`/api/channels?${params.toString()}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setChannels(data.channels)
          setTotalCount(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          console.error("Failed to query channels:", err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    const timeout = setTimeout(fetchFiltered, searchQuery ? 300 : 0)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [searchQuery, selectedCategory, selectedCountry, hasLogoOnly, page])

  // Reset page when filters change
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat)
    setPage(1)
    if (activeTab !== "browse") setActiveTab("browse")
  }

  const handleSelectCountry = (countryCode: string) => {
    setSelectedCountry(countryCode)
    setPage(1)
  }

  // Favorite channels list
  const favoriteChannels = channels.filter((c) => isFavorite(c.id))

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-rose-500/20 selection:text-rose-400">
      {/* Header */}
      <Header
        favoritesCount={favoritesCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalChannels={totalCount}
      />

      <main className="container mx-auto max-w-7xl flex-1 px-4 sm:px-6 py-6 space-y-6">
        {/* Tab 1: DISCOVER */}
        {activeTab === "discover" && (
          <div className="space-y-6 animate-in fade-in-0 duration-300">
            {/* Spotlight Banner */}
            <HeroSection
              channel={initialFeatured.hero}
              onPlay={handleSelectChannel}
              onOpenDetails={handleOpenDetails}
              isFavorite={
                initialFeatured.hero
                  ? isFavorite(initialFeatured.hero.id)
                  : false
              }
              onToggleFavorite={toggleFavorite}
            />

            {/* Recently Watched Row */}
            {history.length > 0 && (
              <ChannelRow
                title="Recently Watched"
                subtitle="Resume your last tuned live broadcasts"
                icon={<History className="size-5" />}
                channels={history}
                activeChannelId={undefined}
                onSelectChannel={handleSelectChannel}
                onOpenDetails={handleOpenDetails}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                action={
                  <button
                    id="clear-recently-watched"
                    onClick={clearHistory}
                    className="flex items-center gap-1.5 h-7 px-3 text-xs font-medium text-zinc-400 hover:text-rose-400 bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/30 rounded-full transition-all cursor-pointer group"
                    title="Clear recently watched channels"
                    aria-label="Clear recently watched channels"
                  >
                    <Trash2 className="size-3.5 transition-colors group-hover:text-rose-400" />
                    <span className="hidden sm:inline">Clear History</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                }
              />
            )}

            {/* Curated Categories Bar for quick hop to Browse */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-rose-500 shrink-0">
                    <Sparkles className="size-4" />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-white">
                    Explore Channels by Category
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>
              <CategoryBar
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                initialCategories={initialCategories}
              />
            </div>

            {/* Featured Rows */}
            <ChannelRow
              title="Global News & Breaking Coverage"
              subtitle="Around-the-clock live journalism from major networks"
              icon={<Newspaper className="size-5" />}
              channels={initialFeatured.news}
              activeChannelId={undefined}
              onSelectChannel={handleSelectChannel}
              onOpenDetails={handleOpenDetails}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />

            <ChannelRow
              title="Sports & Championship Events"
              subtitle="Football, basketball, motorsports, racing and athletics"
              icon={<Trophy className="size-5" />}
              channels={initialFeatured.sports}
              activeChannelId={undefined}
              onSelectChannel={handleSelectChannel}
              onOpenDetails={handleOpenDetails}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />

            <ChannelRow
              title="Cinema, Series & Drama"
              subtitle="Feature films, classic movies, and cinematic broadcasting"
              icon={<Film className="size-5" />}
              channels={initialFeatured.movies}
              activeChannelId={undefined}
              onSelectChannel={handleSelectChannel}
              onOpenDetails={handleOpenDetails}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />

            <ChannelRow
              title="Music, Festivals & Beats"
              subtitle="Live music video streams, concerts and audio visual sets"
              icon={<Music className="size-5" />}
              channels={initialFeatured.music}
              activeChannelId={undefined}
              onSelectChannel={handleSelectChannel}
              onOpenDetails={handleOpenDetails}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />

            <ChannelRow
              title="Animation, Cartoons & Family"
              subtitle="2D/3D anime, animated series, and family entertainment"
              icon={<Tv className="size-5" />}
              channels={initialFeatured.animation}
              activeChannelId={undefined}
              onSelectChannel={handleSelectChannel}
              onOpenDetails={handleOpenDetails}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />

            {/* IPTVMate Live Feeds Row */}
            {initialFeatured.iptvmate && initialFeatured.iptvmate.length > 0 && (
              <ChannelRow
                title="IPTVMate Live Channels & Cams (18+)"
                subtitle="High-definition live streams dynamically parsed from iptvmate.net/files/xxx.m3u"
                icon={<Sparkles className="size-5 text-purple-400" />}
                channels={initialFeatured.iptvmate}
                activeChannelId={undefined}
                onSelectChannel={handleSelectChannel}
                onOpenDetails={handleOpenDetails}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                action={
                  <button
                    onClick={() => setActiveTab("iptvmate")}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    View All {initialFeatured.iptvmate.length} Streams &rarr;
                  </button>
                }
              />
            )}

            {/* NSFW Adult Feeds Row */}
            {initialFeatured.xxx && initialFeatured.xxx.length > 0 && (
              <ChannelRow
                title="NSFW Adult Live Streams (18+)"
                subtitle="Continuous live webcams, feeds and adult channels from AdultIPTV.net"
                icon={<Flame className="size-5 text-rose-500 fill-rose-500/20" />}
                channels={initialFeatured.xxx}
                activeChannelId={undefined}
                onSelectChannel={handleSelectChannel}
                onOpenDetails={handleOpenDetails}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                action={
                  <button
                    onClick={() => setActiveTab("nsfw")}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    View All {initialFeatured.xxx.length} Streams &rarr;
                  </button>
                }
              />
            )}
          </div>
        )}

        {/* Tab 2: BROWSE ALL */}
        {activeTab === "browse" && (
          <div className="space-y-4 animate-in fade-in-0 duration-300">
            {/* Category Pills Bar */}
            <CategoryBar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              initialCategories={initialCategories}
            />

            {/* Filter Toolbar (Countries, Logos, Result Count, View Mode) */}
            <FilterToolbar
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
              countries={initialCountries}
              hasLogoOnly={hasLogoOnly}
              setHasLogoOnly={setHasLogoOnly}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalCount={totalCount}
            />

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="size-8 rounded-full border-2 border-white/10 border-t-rose-500 animate-spin" />
              </div>
            )}

            {/* Channels Grid / List View */}
            {!isLoading && channels.length > 0 && (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {channels.map((ch) => (
                      <ChannelCard
                        key={ch.id}
                        channel={ch}
                        onSelect={handleSelectChannel}
                        onOpenDetails={handleOpenDetails}
                        isFavorite={isFavorite(ch.id)}
                        onToggleFavorite={toggleFavorite}
                        isActivePlaying={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {channels.map((ch) => (
                      <ChannelListItem
                        key={ch.id}
                        channel={ch}
                        onSelect={handleSelectChannel}
                        onOpenDetails={handleOpenDetails}
                        isFavorite={isFavorite(ch.id)}
                        onToggleFavorite={toggleFavorite}
                        isActivePlaying={false}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] my-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-full border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 px-4 h-9 cursor-pointer disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="size-4 mr-1" />
                      Previous
                    </Button>

                    <span className="text-xs text-zinc-400 font-medium">
                      Page <strong className="text-zinc-200 font-mono">{page}</strong> of{" "}
                      <strong className="text-zinc-200 font-mono">{totalPages}</strong>
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-full border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 px-4 h-9 cursor-pointer disabled:opacity-30 transition-all"
                    >
                      Next
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!isLoading && channels.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-zinc-950/40">
                <Search className="size-10 mx-auto text-zinc-600 mb-3" />
                <h4 className="text-base font-semibold text-zinc-300">
                  No Channels Found
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  We could not find any live streams matching your criteria. Try
                  resetting filters or searching for another network.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedCountry("all")
                    setHasLogoOnly(false)
                  }}
                  className="mt-4 border-white/10 text-xs"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: IPTVMATE LIVE FEEDS */}
        {activeTab === "iptvmate" && (
          <IptvMateSection
            channels={initialFeatured.iptvmate || []}
            onSelectChannel={handleSelectChannel}
            onOpenDetails={handleOpenDetails}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Tab 4: NSFW / XXX ADULT LIVE FEEDS */}
        {(activeTab === "xxx" || activeTab === "nsfw") && (
          <AdultSection
            channels={initialFeatured.xxx || []}
            onSelectChannel={handleSelectChannel}
            onOpenDetails={handleOpenDetails}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Tab 4: FAVORITES */}
        {activeTab === "favorites" && (
          <div className="space-y-6 animate-in fade-in-0 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star className="size-5 text-amber-400 fill-amber-400" />
                  Starred Channels
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Your bookmarked television stations and feeds stored locally
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-300">
                {favoritesCount} Starred
              </span>
            </div>

            {favoriteChannels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {favoriteChannels.map((ch) => (
                  <ChannelCard
                    key={ch.id}
                    channel={ch}
                    onSelect={handleSelectChannel}
                    onOpenDetails={handleOpenDetails}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                    isActivePlaying={false}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center bg-zinc-950/40">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mx-auto mb-3">
                  <Star className="size-7" />
                </div>
                <h4 className="text-base font-semibold text-zinc-200">
                  No Favorite Channels Saved Yet
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                  Browse through channels and click the star icon on any card to
                  keep quick access to your favorite stations.
                </p>
                <Button
                  onClick={() => setActiveTab("browse")}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
                >
                  Browse Channels Now
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Channel Details Modal */}
      <ChannelModal
        channel={modalChannel}
        open={!!modalChannel}
        onOpenChange={(open) => !open && handleCloseDetails()}
        onPlay={handleSelectChannel}
        isFavorite={modalChannel ? isFavorite(modalChannel.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-zinc-950/60 py-8 mt-12 text-xs text-zinc-500">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-semibold text-zinc-300">PulseTV</span> — Open
            IPTV Streaming Platform
            <p className="mt-1 text-[11px] text-zinc-600">
              Data aggregated in real-time from{" "}
              <a
                href="https://github.com/iptv-org/api"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 underline hover:text-white"
              >
                iptv-org/api
              </a>
              . Streams are publicly broadcasted by respective networks.
            </p>
          </div>
          <div className="flex items-center gap-4 text-zinc-400 text-xs">
            <span>Powered by Next.js & HLS.js</span>
            <span>•</span>
            <span>Shadcn Theme</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
