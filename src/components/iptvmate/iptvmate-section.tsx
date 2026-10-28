"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Sparkles,
  ShieldAlert,
  Search,
  LayoutGrid,
  List,
  Radio,
  Play,
  RotateCw,
  ExternalLink,
  Info,
  Star,
  Film,
  Camera,
  Layers,
} from "lucide-react";
import { EnrichedChannel } from "@/types/iptv";
import { ChannelCard } from "@/components/channels/channel-card";
import { ChannelListItem } from "@/components/channels/channel-list-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IptvMateSectionProps {
  channels: EnrichedChannel[];
  onSelectChannel: (channel: EnrichedChannel) => void;
  onOpenDetails: (channel: EnrichedChannel) => void;
  isFavorite: (channelId: string) => boolean;
  onToggleFavorite: (channelId: string) => void;
}

const PROVIDER_OPTIONS = [
  { id: "all", label: "All Feeds" },
  { id: "MyCamTV", label: "MyCamTV Live" },
  { id: "IPTVXXX", label: "IPTVXXX Feeds" },
];

const GENRE_TAGS = [
  "All",
  "Teen",
  "MILF",
  "Live Cams",
  "Mature",
  "Asian",
  "Latina",
  "Ebony",
  "Brunette",
  "Blonde",
  "Big Tits",
  "Big Ass",
  "Anal",
  "Blowjob",
  "Squirt",
  "Hardcore",
  "Threesome",
  "Lesbian",
  "POV",
  "Pornstar",
  "Fetish",
  "Interracial",
  "Gay",
];

export function IptvMateSection({
  channels: initialChannels,
  onSelectChannel,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
}: IptvMateSectionProps) {
  const [channels, setChannels] = useState<EnrichedChannel[]>(initialChannels);
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedTag, setSelectedTag] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Sync state if initialChannels update from server
  React.useEffect(() => {
    if (initialChannels && initialChannels.length > 0) {
      setChannels(initialChannels);
    }
  }, [initialChannels]);

  // Handle re-fetching from source
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      const res = await fetch("/api/iptvmate?refresh=true");
      if (res.ok) {
        const data = await res.json();
        if (data.channels && data.channels.length > 0) {
          setChannels(data.channels);
          setRefreshMessage(`Successfully synced ${data.channels.length} live streams!`);
        }
      }
    } catch (e) {
      console.error("Refresh failed:", e);
      setRefreshMessage("Failed to sync latest M3U. Using cached streams.");
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshMessage(null), 4000);
    }
  };

  // Filter channels based on provider, search, and genre tags
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      // Provider filter
      if (
        selectedProvider !== "all" &&
        (!c.network || c.network.toLowerCase() !== selectedProvider.toLowerCase())
      ) {
        return false;
      }

      // Search filter
      const matchesSearch =
        search.trim() === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.alt_names?.some((alt) =>
          alt.toLowerCase().includes(search.toLowerCase())
        ) ||
        c.labels?.some((lbl) =>
          lbl.toLowerCase().includes(search.toLowerCase())
        );

      if (!matchesSearch) return false;

      // Tag filter
      if (selectedTag === "All") return true;
      const term = selectedTag.toLowerCase();
      const matchesTag =
        c.name.toLowerCase().includes(term) ||
        c.alt_names?.some((alt) => alt.toLowerCase().includes(term)) ||
        c.labels?.some((lbl) => lbl.toLowerCase().includes(term));

      return matchesTag;
    });
  }, [channels, selectedProvider, search, selectedTag]);

  const previewChannel = filteredChannels[0] || channels[0] || null;

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Cinematic Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-zinc-950 via-purple-950/25 to-zinc-950 p-6 sm:p-8 shadow-2xl">
        <div className="pointer-events-none absolute -top-24 right-10 size-80 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 size-80 rounded-full bg-pink-600/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-purple-600/25">
                <Sparkles className="size-3.5 fill-current animate-pulse" />
                IPTVMate Stream Hub
              </span>
              <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                18+ Adult Feeds
              </span>
              <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs font-mono text-zinc-300">
                {channels.length} Total Streams
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                <Radio className="size-3 animate-ping" />
                Live HLS 1080p
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              IPTVMate Live Channels & Cams
            </h1>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Real-time live television and interactive broadcast webcams parsed
              directly from{" "}
              <a
                href="https://iptvmate.net/files/xxx.m3u"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 underline font-mono text-xs inline-flex items-center gap-1"
              >
                iptvmate.net/files/xxx.m3u
                <ExternalLink className="size-3 inline" />
              </a>
              . Powered by ultra low-latency adaptive HLS streaming with dual HTTP/HTTPS feeds.
            </p>

            {/* Source info and disclaimer */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="flex items-start gap-2 rounded-xl border border-purple-500/20 bg-purple-950/20 p-2.5 text-xs text-purple-200/90 flex-1">
                <ShieldAlert className="size-4 shrink-0 text-purple-400 mt-0.5" />
                <span>
                  <strong>Source M3U Playlist:</strong> Live aggregation from
                  MyCamTV and IPTVXXX network servers.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-auto py-2 px-3 border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-300 text-xs shrink-0 self-start sm:self-auto cursor-pointer"
                title="Re-fetch playlist from iptvmate.net"
              >
                <RotateCw
                  className={`size-3.5 mr-1.5 ${
                    isRefreshing ? "animate-spin text-purple-400" : ""
                  }`}
                />
                {isRefreshing ? "Syncing..." : "Sync Source"}
              </Button>
            </div>

            {refreshMessage && (
              <p className="text-xs font-medium text-emerald-400 animate-in fade-in duration-200">
                {refreshMessage}
              </p>
            )}
          </div>

          {/* Quick Spotlight Card */}
          {previewChannel && (
            <div className="shrink-0 lg:w-80 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
                  Featured Broadcast
                </span>
                <Badge variant="live" className="text-[10px]">
                  1080p HD
                </Badge>
              </div>

              <div className="relative my-3 flex h-28 items-center justify-center rounded-xl bg-black/60 border border-white/5 overflow-hidden group">
                <Image
                  src={previewChannel.logo || "/images/iptvmate.svg"}
                  alt={previewChannel.name}
                  width={200}
                  height={80}
                  className="max-h-20 max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => onSelectChannel(previewChannel)}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/50 hover:scale-110 transition-transform">
                    <Play className="size-5 fill-current ml-0.5" />
                  </span>
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white truncate">
                  {previewChannel.name}
                </h4>
                <p className="text-xs text-zinc-400 truncate">
                  {previewChannel.network || "IPTVMate"} • 24/7 Live Stream
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => onSelectChannel(previewChannel)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs h-8 cursor-pointer shadow-md shadow-purple-600/20"
                >
                  <Play className="size-3.5 fill-current mr-1.5" />
                  Watch Live Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenDetails(previewChannel)}
                  className="border-white/10 hover:bg-white/5 text-zinc-300 text-xs h-8 px-2.5 cursor-pointer"
                  title="Channel Information"
                >
                  <Info className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleFavorite(previewChannel.id)}
                  className={`border-white/10 hover:bg-white/5 text-xs h-8 px-2.5 cursor-pointer ${
                    isFavorite(previewChannel.id)
                      ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                      : "text-zinc-400"
                  }`}
                  title="Bookmark Channel"
                >
                  <Star
                    className={`size-3.5 ${
                      isFavorite(previewChannel.id) ? "fill-amber-400" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <span className="text-xs font-semibold text-zinc-400 mr-1 flex items-center gap-1.5">
          <Layers className="size-3.5 text-purple-400" />
          Network:
        </span>
        {PROVIDER_OPTIONS.map((provider) => {
          const count =
            provider.id === "all"
              ? channels.length
              : channels.filter(
                  (c) =>
                    c.network &&
                    c.network.toLowerCase() === provider.id.toLowerCase()
                ).length;

          return (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedProvider === provider.id
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
              }`}
            >
              <span>{provider.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  selectedProvider === provider.id
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IPTVMate streams, tags, or cams..."
            className="h-10 w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-9 pr-8 text-xs text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-zinc-400 font-medium">
            Showing <strong className="text-white">{filteredChannels.length}</strong> of{" "}
            <span className="font-mono">{channels.length}</span> streams
          </span>

          <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900/60 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex size-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex size-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="List View"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Genre / Tag Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {GENRE_TAGS.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                isSelected
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 border border-white/5"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Channels Display */}
      {filteredChannels.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onSelect={onSelectChannel}
                onOpenDetails={onOpenDetails}
                isFavorite={isFavorite(channel.id)}
                onToggleFavorite={onToggleFavorite}
                isActivePlaying={false}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChannels.map((channel) => (
              <ChannelListItem
                key={channel.id}
                channel={channel}
                onSelect={onSelectChannel}
                onOpenDetails={onOpenDetails}
                isFavorite={isFavorite(channel.id)}
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
            No IPTVMate Streams Found
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            No live streams match your current search query or tag selection.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedProvider("all");
              setSelectedTag("All");
            }}
            className="border-purple-500/30 text-purple-300 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
