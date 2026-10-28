"use client"

import React from "react"
import { Play, Info, Star } from "lucide-react"
import { EnrichedChannel } from "@/types/iptv"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  channel: EnrichedChannel | null
  onPlay: (channel: EnrichedChannel) => void
  onOpenDetails: (channel: EnrichedChannel) => void
  isFavorite: boolean
  onToggleFavorite: (channelId: string) => void
}

export function HeroSection({
  channel,
  onPlay,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
}: HeroSectionProps) {
  if (!channel) return null

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-[#0d0f17]/90 to-[#090a10] p-6 sm:p-10 shadow-2xl my-3">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-rose-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 size-96 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Column: Details & Call to Action */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          {/* Metadata chips */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/25 px-2.5 py-1 text-[11px] font-bold tracking-wider text-rose-400">
              <span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
              SPOTLIGHT LIVE
            </span>

            {channel.quality && (
              <span className="rounded-full bg-white/[0.06] border border-white/[0.1] px-2.5 py-0.5 text-[11px] font-mono font-medium text-zinc-300">
                {channel.quality}
              </span>
            )}

            {channel.countryName && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 text-xs text-zinc-300">
                {channel.countryFlag && <span>{channel.countryFlag}</span>}
                <span className="font-medium text-zinc-300">{channel.countryName}</span>
              </span>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm">
            {channel.name}
          </h2>

          <p className="max-w-xl text-sm sm:text-base text-zinc-300/90 leading-relaxed font-normal">
            {channel.network
              ? `Broadcasting worldwide from ${channel.network}. Stream live news, breaking coverage, and culture in crisp digital clarity.`
              : `Stream live broadcast feed with instant zero-buffer HLS streaming, multi-device support, and high definition clarity.`}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => onPlay(channel)}
              className="bg-white hover:bg-zinc-100 text-zinc-950 font-semibold shadow-xl shadow-white/10 px-7 h-11 text-sm rounded-full transition-all hover:scale-102 cursor-pointer border-0"
            >
              <Play className="size-4 mr-2 fill-zinc-950 text-zinc-950" />
              Watch Live Feed
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => onOpenDetails(channel)}
              className="border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 h-11 px-5 text-sm rounded-full cursor-pointer transition-all"
            >
              <Info className="size-4 mr-2 text-zinc-400" />
              Channel Details
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleFavorite(channel.id)}
              className={`size-11 rounded-full border-white/[0.12] cursor-pointer transition-all ${
                isFavorite
                  ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white"
              }`}
              title="Add to Favorites"
            >
              <Star
                className={`size-4 ${isFavorite ? "fill-amber-400" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Right Column: Floating Glass Showcase Card */}
        <div className="relative shrink-0">
          <div className="relative flex size-44 sm:size-52 items-center justify-center rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-black/60 p-6 backdrop-blur-xl shadow-2xl ring-1 ring-white/[0.06] group transition-transform duration-300 hover:scale-[1.02]">
            {/* Top Right Live Pill */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-400">
              <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" />
              LIVE
            </div>

            {channel.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={channel.logo}
                alt={channel.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500/20 via-zinc-800 to-indigo-500/20 text-3xl font-bold text-white border border-white/10">
                {channel.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="absolute -bottom-3 rounded-full bg-white/10 border border-white/15 px-3 py-0.5 text-[10px] font-semibold text-zinc-200 shadow-lg backdrop-blur-md">
              LIVE BROADCAST
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
