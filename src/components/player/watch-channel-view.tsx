"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { VideoPlayer } from "@/components/player/video-player"
import { ChannelCard } from "@/components/channels/channel-card"
import { ChannelModal } from "@/components/channels/channel-modal"
import { useFavorites } from "@/hooks/use-favorites"
import { useWatchHistory } from "@/hooks/use-watch-history"
import { EnrichedChannel } from "@/types/iptv"
import {
  ArrowLeft,
  Star,
  Share2,
  Check,
  Globe,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface WatchChannelViewProps {
  channel: EnrichedChannel
  relatedChannels: EnrichedChannel[]
}

export function WatchChannelView({
  channel,
  relatedChannels,
}: WatchChannelViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromQuery = searchParams?.get("from") || ""

  const { isFavorite, toggleFavorite } = useFavorites()
  const { addToHistory } = useWatchHistory()
  const [copiedShare, setCopiedShare] = useState(false)
  const [modalChannel, setModalChannel] = useState<EnrichedChannel | null>(null)

  // Track return destination URL so all filters/pagination/tabs are preserved
  const [backUrl, setBackUrl] = useState<string>("/")

  useEffect(() => {
    if (fromQuery) {
      const decoded = decodeURIComponent(fromQuery)
      const target = decoded.startsWith("/")
        ? decoded
        : decoded.startsWith("?")
        ? `/${decoded}`
        : `/?${decoded}`
      setBackUrl(target)
    } else if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("iptv_last_browse_query")
      if (saved) {
        const target = saved.startsWith("/")
          ? saved
          : saved.startsWith("?")
          ? `/${saved}`
          : `/?${saved}`
        setBackUrl(target)
      }
    }
  }, [fromQuery])

  // Track in watch history on load
  useEffect(() => {
    if (channel) {
      addToHistory(channel)
    }
  }, [channel, addToHistory])

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2000)
    }
  }

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    if (backUrl && backUrl !== "/") {
      router.push(backUrl)
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  const handleSelectRelated = (ch: EnrichedChannel) => {
    const returnParam = fromQuery ? `?from=${encodeURIComponent(fromQuery)}` : ""
    router.push(`/watch/${encodeURIComponent(ch.id)}${returnParam}`)
  }

  const channelIsFav = isFavorite(channel.id)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-rose-500/20 selection:text-rose-400">
      {/* Global Header */}
      <Header />

      <main className="container mx-auto max-w-7xl flex-1 px-4 sm:px-6 py-4 space-y-4">
        {/* Navigation Bar / Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backUrl}
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-all bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2 rounded-full border border-white/[0.08] hover:border-white/20 group cursor-pointer shadow-xs"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5 text-zinc-400 group-hover:text-white" />
            <span>Back to Channels</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="flex size-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-zinc-500">Live Broadcast ID:</span>
            <span className="text-zinc-200 font-semibold">{channel.id}</span>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="relative">
          <div className="pointer-events-none absolute -top-12 left-1/4 size-96 rounded-full bg-rose-600/10 blur-3xl -z-10" />
          <div className="pointer-events-none absolute -bottom-10 right-1/4 size-96 rounded-full bg-purple-600/10 blur-3xl -z-10" />

          {/* Dedicated Video Player (Constrained to viewport minus navbar) */}
          <div className="rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/[0.08] bg-black flex items-center justify-center max-h-[calc(100vh-10rem)]">
            <VideoPlayer
              key={channel.id}
              channel={channel}
              isFavorite={channelIsFav}
              onToggleFavorite={toggleFavorite}
              className="max-h-[calc(100vh-10rem)]"
            />
          </div>
        </div>

        {/* Channel Information Header & Control Bar */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Channel Identity */}
            <div className="flex items-start gap-4">
              {channel.logo ? (
                <div className="relative flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/70 p-2 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-zinc-950">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  </span>
                </div>
              ) : (
                <div className="flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-rose-600/20 to-purple-600/20 text-xl font-bold text-white border border-white/10">
                  {channel.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="live" className="text-xs px-2.5 py-0.5">
                    ● ON AIR
                  </Badge>
                  {channel.quality && (
                    <Badge variant="quality">{channel.quality}</Badge>
                  )}
                  {channel.countryFlag && (
                    <span className="text-xl" title={channel.countryName}>
                      {channel.countryFlag}
                    </span>
                  )}
                  {channel.countryName && (
                    <span className="text-xs text-zinc-400 font-medium">
                      {channel.countryName}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {channel.name}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  {channel.network && (
                    <span className="font-medium text-zinc-300">
                      Network: {channel.network}
                    </span>
                  )}
                  {channel.categories?.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-zinc-300 capitalize text-[11px]"
                    >
                      {cat}
                    </span>
                  ))}
                  {channel.streams && channel.streams.length > 1 && (
                    <span className="text-rose-400 font-medium">
                      • {channel.streams.length} Stream Feeds Available
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
              <Button
                variant="outline"
                onClick={() => toggleFavorite(channel.id)}
                className={`h-10 px-4 rounded-xl border-white/15 text-xs font-semibold cursor-pointer ${
                  channelIsFav
                    ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
                    : "bg-white/5 hover:bg-white/10 text-zinc-200"
                }`}
              >
                <Star
                  className={`size-4 mr-2 ${channelIsFav ? "fill-amber-400" : ""}`}
                />
                {channelIsFav ? "Saved to Favorites" : "Add to Favorites"}
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                className="h-10 px-4 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                {copiedShare ? (
                  <>
                    <Check className="size-4 mr-1.5 text-emerald-400" />
                    Copied Link!
                  </>
                ) : (
                  <>
                    <Share2 className="size-4 mr-1.5" />
                    Share Channel
                  </>
                )}
              </Button>

              {channel.website && (
                <a
                  href={channel.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 px-3.5 text-xs font-semibold transition-colors gap-1.5"
                  title="Official Broadcaster Website"
                >
                  <Globe className="size-4" />
                  <span className="hidden sm:inline">Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Technical Channel Specs Grid */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-zinc-500 block mb-0.5">Stream Quality</span>
              <span className="text-zinc-200 font-medium font-mono">
                {channel.quality || "Standard / HD Stream"}
              </span>
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-zinc-500 block mb-0.5">Origin Region</span>
              <span className="text-zinc-200 font-medium">
                {channel.countryName || channel.country || "Global"}
              </span>
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-zinc-500 block mb-0.5">Broadcaster Network</span>
              <span className="text-zinc-200 font-medium truncate block">
                {channel.network || "Independent Station"}
              </span>
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-zinc-500 block mb-0.5">Stream Protocol</span>
              <span className="text-zinc-200 font-medium font-mono">
                HLS (.m3u8) Live
              </span>
            </div>
          </div>
        </div>

        {/* Related / More Channels to Watch */}
        {relatedChannels.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Sparkles className="size-5 text-rose-500" />
                  More Channels You Might Like
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Explore other live broadcasting stations in{" "}
                  {channel.categories?.[0] || "this category"}
                </p>
              </div>

              <Link
                href="/?tab=browse"
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
              >
                Browse All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {relatedChannels.map((ch) => (
                <ChannelCard
                  key={ch.id}
                  channel={ch}
                  onSelect={handleSelectRelated}
                  onOpenDetails={setModalChannel}
                  isFavorite={isFavorite(ch.id)}
                  onToggleFavorite={toggleFavorite}
                  isActivePlaying={false}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Channel Details Modal */}
      <ChannelModal
        channel={modalChannel}
        open={!!modalChannel}
        onOpenChange={(open) => !open && setModalChannel(null)}
        onPlay={handleSelectRelated}
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
              Streams are publicly broadcasted by respective networks. Data
              aggregated from iptv-org.
            </p>
          </div>
          <div className="flex items-center gap-4 text-zinc-400 text-xs">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>•</span>
            <Link href="/?tab=browse" className="hover:text-white transition-colors">
              Browse All
            </Link>
            <span>•</span>
            <Link href="/?tab=favorites" className="hover:text-white transition-colors">
              Favorites
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
