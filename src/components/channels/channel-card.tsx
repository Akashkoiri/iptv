"use client"

import React, { useState } from "react"
import { Play, Star, Info } from "lucide-react"
import { EnrichedChannel } from "@/types/iptv"
import { Badge } from "@/components/ui/badge"

interface ChannelCardProps {
  channel: EnrichedChannel
  onSelect: (channel: EnrichedChannel) => void
  onOpenDetails: (channel: EnrichedChannel) => void
  isFavorite: boolean
  onToggleFavorite: (channelId: string) => void
  isActivePlaying?: boolean
}

export function ChannelCard({
  channel,
  onSelect,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
  isActivePlaying = false,
}: ChannelCardProps) {
  const [imgError, setImgError] = useState(false)

  // Monogram initials for fallback avatar
  const initials = channel.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-300 cursor-pointer ${
        isActivePlaying
          ? "border-rose-500/50 bg-rose-500/[0.08] shadow-lg shadow-rose-500/15 ring-1 ring-rose-500/30"
          : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1"
      }`}
    >
      {/* Top Bar: Country & Favorite */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {channel.countryFlag && (
            <span className="text-base leading-none" title={channel.countryName}>
              {channel.countryFlag}
            </span>
          )}
          {channel.country && (
            <span className="rounded-full bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 text-[10px] font-semibold text-zinc-300 font-mono tracking-wider">
              {channel.country}
            </span>
          )}
          {isActivePlaying && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              PLAYING
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(channel.id)
            }}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            className={`flex size-7 items-center justify-center rounded-full transition-all cursor-pointer ${
              isFavorite
                ? "text-amber-400 hover:text-amber-300 bg-amber-400/10 border border-amber-400/25"
                : "text-zinc-500 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]"
            }`}
          >
            <Star
              className={`size-3.5 transition-transform group-hover:scale-105 ${
                isFavorite ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenDetails(channel)
            }}
            title="Channel Details"
            className="flex size-7 items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
          >
            <Info className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Channel Logo or Monogram with hover play button */}
      <div className="relative my-2 flex h-24 w-full items-center justify-center rounded-xl bg-gradient-to-b from-black/40 to-black/70 border border-white/[0.06] p-3 transition-all group-hover:border-white/15">
        {channel.logo && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.logo}
            alt={channel.name}
            onError={() => setImgError(true)}
            className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500/20 via-zinc-800 to-indigo-500/20 text-sm font-bold text-zinc-200 border border-white/10">
            {initials || "TV"}
          </div>
        )}

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100 rounded-xl">
          <div className="flex size-11 items-center justify-center rounded-full bg-white text-zinc-950 shadow-2xl transition-transform duration-200 group-hover:scale-105">
            <Play className="size-5 fill-zinc-950 text-zinc-950 translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom Info: Channel Title, Network, Quality, Category */}
      <div className="mt-3">
        <h4 className="truncate font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors">
          {channel.name}
        </h4>

        <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
          <span className="truncate max-w-35 text-[11px] text-zinc-400">
            {channel.network || channel.categories?.[0] || "Live Broadcast"}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {channel.quality && (
              <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.2 text-[10px] font-mono text-zinc-300 font-medium">
                {channel.quality}
              </span>
            )}
            {channel.streams && channel.streams.length > 1 && (
              <span
                className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.2 text-[10px] font-mono text-rose-400"
                title={`${channel.streams.length} stream feeds available`}
              >
                {channel.streams.length} feeds
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
