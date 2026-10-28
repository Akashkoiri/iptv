"use client"

import React, { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { EnrichedChannel } from "@/types/iptv"
import { ChannelCard } from "@/components/channels/channel-card"

interface ChannelRowProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  channels: EnrichedChannel[]
  activeChannelId?: string
  onSelectChannel: (channel: EnrichedChannel) => void
  onOpenDetails: (channel: EnrichedChannel) => void
  isFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
  action?: React.ReactNode
}

export function ChannelRow({
  title,
  subtitle,
  icon,
  channels,
  activeChannelId,
  onSelectChannel,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
  action,
}: ChannelRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  if (!channels || channels.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current
      const offset = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75
      rowRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" })
    }
  }

  return (
    <section className="my-6">
      {/* Row Header */}
      <div className="flex items-end justify-between mb-3 px-1 gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {icon && (
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-rose-500 shrink-0">
                {icon}
              </span>
            )}
            <h3 className="text-lg font-bold tracking-tight text-white truncate">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        {/* Action & Scroll Arrows */}
        <div className="flex items-center gap-2 shrink-0">
          {action}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              className="flex size-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex size-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none no-scrollbar snap-x scroll-smooth"
      >
        {channels.map((ch) => (
          <div
            key={ch.id}
            className="w-56 sm:w-64 shrink-0 snap-start"
          >
            <ChannelCard
              channel={ch}
              onSelect={onSelectChannel}
              onOpenDetails={onOpenDetails}
              isFavorite={isFavorite(ch.id)}
              onToggleFavorite={onToggleFavorite}
              isActivePlaying={activeChannelId === ch.id}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
