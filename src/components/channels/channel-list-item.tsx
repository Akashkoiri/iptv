"use client"

import React, { useState } from "react"
import { Play, Star, Info } from "lucide-react"
import { EnrichedChannel } from "@/types/iptv"
import { Badge } from "@/components/ui/badge"

interface ChannelListItemProps {
  channel: EnrichedChannel
  onSelect: (channel: EnrichedChannel) => void
  onOpenDetails: (channel: EnrichedChannel) => void
  isFavorite: boolean
  onToggleFavorite: (channelId: string) => void
  isActivePlaying?: boolean
}

export function ChannelListItem({
  channel,
  onSelect,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
  isActivePlaying = false,
}: ChannelListItemProps) {
  const [imgError, setImgError] = useState(false)

  const initials = channel.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group flex items-center justify-between rounded-2xl border p-3.5 transition-all cursor-pointer ${
        isActivePlaying
          ? "border-rose-500/50 bg-rose-500/[0.08] shadow-md ring-1 ring-rose-500/30"
          : "border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] hover:shadow-lg"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Logo / Monogram */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/60 p-1.5 shadow-inner">
          {channel.logo && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={channel.logo}
              alt={channel.name}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-xs font-bold text-zinc-300">
              {initials || "TV"}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
              {channel.name}
            </h4>
            {channel.countryFlag && (
              <span className="text-sm leading-none" title={channel.countryName}>
                {channel.countryFlag}
              </span>
            )}
            {isActivePlaying && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-bold text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PLAYING
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
            {channel.network && (
              <span className="truncate max-w-35 text-zinc-400">
                {channel.network}
              </span>
            )}
            {channel.categories?.[0] && (
              <span className="capitalize text-zinc-500">
                • {channel.categories[0]}
              </span>
            )}
            {channel.countryName && (
              <span className="text-zinc-500 hidden sm:inline">
                • {channel.countryName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions & Badges */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {channel.quality && (
          <span className="hidden sm:inline-block rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-zinc-300">
            {channel.quality}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(channel.id)
          }}
          className={`flex size-8 items-center justify-center rounded-full transition-all cursor-pointer ${
            isFavorite
              ? "text-amber-400 hover:text-amber-300 bg-amber-400/10 border border-amber-400/25"
              : "text-zinc-500 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]"
          }`}
          title={isFavorite ? "Remove favorite" : "Add favorite"}
        >
          <Star
            className={`size-3.5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetails(channel)
          }}
          className="flex size-8 items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
          title="Channel details"
        >
          <Info className="size-3.5" />
        </button>

        <div className="flex size-8 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md group-hover:scale-105 transition-transform">
          <Play className="size-4 fill-zinc-950 text-zinc-950 translate-x-0.2" />
        </div>
      </div>
    </div>
  )
}
