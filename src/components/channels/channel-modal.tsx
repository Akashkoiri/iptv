"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { EnrichedChannel } from "@/types/iptv"
import {
  Play,
  Star,
  Copy,
  Check,
  Globe,
  Layers,
} from "lucide-react"

interface ChannelModalProps {
  channel: EnrichedChannel | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlay: (channel: EnrichedChannel) => void
  isFavorite: boolean
  onToggleFavorite: (channelId: string) => void
}

export function ChannelModal({
  channel,
  open,
  onOpenChange,
  onPlay,
  isFavorite,
  onToggleFavorite,
}: ChannelModalProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  if (!channel) return null

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-4">
          {channel.logo ? (
            <div className="size-14 overflow-hidden rounded-xl border border-white/10 bg-black/60 p-1.5 flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={channel.logo}
                alt={channel.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-rose-500/20 to-purple-500/20 text-lg font-bold text-zinc-100 border border-white/10">
              {channel.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl">{channel.name}</DialogTitle>
              {channel.countryFlag && (
                <span className="text-lg" title={channel.countryName}>
                  {channel.countryFlag}
                </span>
              )}
            </div>
            <DialogDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              {channel.countryName && <span>{channel.countryName}</span>}
              {channel.network && <span>• Network: {channel.network}</span>}
              {channel.categories?.map((cat) => (
                <span
                  key={cat}
                  className="rounded-md bg-white/10 px-2 py-0.5 text-zinc-300 capitalize"
                >
                  {cat}
                </span>
              ))}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Main Metadata Content */}
      <div className="space-y-4 my-2 text-sm">
        {/* Actions Bar */}
        <div className="flex items-center gap-2 pt-1 pb-2 border-b border-white/[0.08]">
          <Button
            onClick={() => {
              onPlay(channel)
              onOpenChange(false)
            }}
            className="flex-1 bg-white hover:bg-zinc-100 text-zinc-950 font-semibold rounded-full h-10 shadow-sm cursor-pointer border-0"
          >
            <Play className="size-4 mr-1.5 fill-zinc-950 text-zinc-950" />
            Watch Live Broadcast
          </Button>

          <Button
            variant="outline"
            onClick={() => onToggleFavorite(channel.id)}
            className={`rounded-full h-10 px-4 cursor-pointer transition-all ${
              isFavorite
                ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
                : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300"
            }`}
          >
            <Star
              className={`size-4 mr-1.5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
            />
            {isFavorite ? "Starred" : "Favorite"}
          </Button>

          {channel.website && (
            <a
              href={channel.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Official Broadcaster Website"
            >
              <Globe className="size-4" />
            </a>
          )}
        </div>

        {/* Channel Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
          <div>
            <span className="text-zinc-500 block mb-0.5">Channel ID</span>
            <span className="font-mono text-zinc-300 break-all">
              {channel.id}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block mb-0.5">Broadcast Format</span>
            <span className="text-zinc-300">
              {channel.quality || "Standard / HD Stream"}
            </span>
          </div>

          {channel.launched && (
            <div>
              <span className="text-zinc-500 block mb-0.5">Launched</span>
              <span className="text-zinc-300">{channel.launched}</span>
            </div>
          )}

          {channel.owners && channel.owners.length > 0 && (
            <div>
              <span className="text-zinc-500 block mb-0.5">Owner</span>
              <span className="text-zinc-300 truncate block">
                {channel.owners.join(", ")}
              </span>
            </div>
          )}

          {channel.alt_names && channel.alt_names.length > 0 && (
            <div className="col-span-2">
              <span className="text-zinc-500 block mb-0.5">
                Alternative Names
              </span>
              <span className="text-zinc-300">
                {channel.alt_names.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Streams List */}
        <div>
          <h5 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="size-3.5" />
            Available Stream Feeds ({channel.streams?.length || 1})
          </h5>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {channel.streams?.map((stream, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/60 p-2.5 text-xs hover:border-white/20 transition-colors"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200 truncate">
                      {stream.title || `Feed #${idx + 1}`}
                    </span>
                    {stream.quality && (
                      <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
                        {stream.quality}
                      </span>
                    )}
                  </div>
                  <p className="truncate font-mono text-[11px] text-zinc-500 mt-0.5">
                    {stream.url}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyUrl(stream.url)}
                    className="h-7 px-2 text-[11px]"
                    title="Copy stream link"
                  >
                    {copiedUrl === stream.url ? (
                      <Check className="size-3 text-emerald-400 mr-1" />
                    ) : (
                      <Copy className="size-3 mr-1" />
                    )}
                    {copiedUrl === stream.url ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
