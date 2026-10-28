"use client";

import React, { useState, useMemo } from "react";
import {
  Flame,
  ShieldAlert,
  Search,
  LayoutGrid,
  List,
  Radio,
  Play,
  Sparkles,
  Lock,
  Tv,
} from "lucide-react";
import { EnrichedChannel } from "@/types/iptv";
import { ChannelCard } from "@/components/channels/channel-card";
import { ChannelListItem } from "@/components/channels/channel-list-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdultSectionProps {
  channels: EnrichedChannel[];
  onSelectChannel: (channel: EnrichedChannel) => void;
  onOpenDetails: (channel: EnrichedChannel) => void;
  isFavorite: (channelId: string) => boolean;
  onToggleFavorite: (channelId: string) => void;
}

const GENRE_TAGS = [
  "All",
  "NSFW",
  "Live Cams",
  "MILF",
  "Latina",
  "Asian",
  "Lesbian",
  "POV",
  "Blowjob",
  "Anal",
  "Hardcore",
  "Threesome",
  "Pornstar",
  "Big Tits",
  "Big Ass",
  "Gay",
];

export function AdultSection({
  channels,
  onSelectChannel,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
}: AdultSectionProps) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewChannel, setPreviewChannel] = useState<EnrichedChannel | null>(
    channels[0] || null,
  );

  // Filter channels based on search and genre tags
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      const matchesSearch =
        search.trim() === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.alt_names?.some((alt) =>
          alt.toLowerCase().includes(search.toLowerCase()),
        ) ||
        c.labels?.some((lbl) =>
          lbl.toLowerCase().includes(search.toLowerCase()),
        );

      const matchesTag =
        selectedTag === "All" ||
        c.name.toLowerCase().includes(selectedTag.toLowerCase()) ||
        c.alt_names?.some((alt) =>
          alt.toLowerCase().includes(selectedTag.toLowerCase()),
        ) ||
        c.labels?.some((lbl) =>
          lbl.toLowerCase().includes(selectedTag.toLowerCase()),
        );

      return matchesSearch && matchesTag;
    });
  }, [channels, search, selectedTag]);

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Cinematic Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-br from-zinc-950 via-rose-950/20 to-zinc-950 p-6 sm:p-8 shadow-2xl">
        <div className="pointer-events-none absolute -top-24 right-10 size-80 rounded-full bg-rose-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 size-80 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-rose-600/30">
                <Flame className="size-3.5 fill-current animate-pulse" />
                NSFW / Adult Live Broadcasts
              </span>
              <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                18+ Only
              </span>
              <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs font-mono text-zinc-300">
                {channels.length} Live Channels
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                <Radio className="size-3 animate-ping" />
                Active HLS
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              AdultIPTV.net Live Streams
            </h1>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Continuous 24/7 high-definition adult television stations, live
              webcams, and themed channels. Streamed with low-latency adaptive HLS
              directly to your browser.
            </p>

            {/* Quick 18+ Disclaimer notice */}
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-xs text-rose-300/90">
              <ShieldAlert className="size-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                <strong>Viewer Discretion Advised:</strong> This section contains
                explicit adult content intended exclusively for viewers aged 18
                years and older.
              </span>
            </div>
          </div>

          {/* Quick Spotlight Card */}
          {previewChannel && (
            <div className="shrink-0 lg:w-80 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                  Featured Channel
                </span>
                <Badge variant="live" className="text-[10px]">
                  1080p HD
                </Badge>
              </div>

              <div className="relative my-3 flex h-28 items-center justify-center rounded-xl bg-black/60 border border-white/5 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewChannel.logo || "/images/adultiptv.svg"}
                  alt={previewChannel.name}
                  className="max-h-20 max-w-full object-contain filter drop-shadow-md"
                />
              </div>

              <div className="font-bold text-white text-sm truncate">
                {previewChannel.name}
              </div>
              <div className="text-xs text-zinc-400 mb-3">
                Provider: {previewChannel.network}
              </div>

              <Button
                onClick={() => onSelectChannel(previewChannel)}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-semibold text-xs h-9 shadow-md shadow-rose-600/30 cursor-pointer"
              >
                <Play className="size-3.5 mr-1.5 fill-current" />
                Watch Stream Now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {GENRE_TAGS.map((tag) => {
          const isActive = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-rose-600/30 font-semibold"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.07]"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Search & Layout Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter adult channels..."
            className="h-9 w-full rounded-full border border-white/[0.08] bg-white/[0.04] pl-9.5 pr-8 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-4 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <span className="text-xs text-zinc-400 font-medium">
            Showing <strong className="text-zinc-200 font-mono">{filteredChannels.length}</strong> of{" "}
            <span className="font-mono">{channels.length}</span> feeds
          </span>

          <div className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-full size-7 flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-zinc-950 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-full size-7 flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-zinc-950 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="List View"
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Channels Display */}
      {filteredChannels.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredChannels.map((ch) => (
              <ChannelCard
                key={ch.id}
                channel={ch}
                onSelect={(channel) => {
                  setPreviewChannel(channel);
                  onSelectChannel(channel);
                }}
                onOpenDetails={onOpenDetails}
                isFavorite={isFavorite(ch.id)}
                onToggleFavorite={onToggleFavorite}
                isActivePlaying={false}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChannels.map((ch) => (
              <ChannelListItem
                key={ch.id}
                channel={ch}
                onSelect={(channel) => {
                  setPreviewChannel(channel);
                  onSelectChannel(channel);
                }}
                onOpenDetails={onOpenDetails}
                isFavorite={isFavorite(ch.id)}
                onToggleFavorite={onToggleFavorite}
                isActivePlaying={false}
              />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-zinc-950/40">
          <Search className="size-10 mx-auto text-zinc-600 mb-3" />
          <h4 className="text-base font-semibold text-zinc-300">
            No Adult Streams Found
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
            No feeds matched &quot;{search || selectedTag}&quot;. Try resetting
            your search term or selecting another category.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedTag("All");
            }}
            className="mt-4 border-white/10 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
