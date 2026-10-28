"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import Hls from "hls.js"
import { useQueryState, parseAsInteger, parseAsBoolean } from "nuqs"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Tv,
  Layers,
} from "lucide-react"
import { EnrichedChannel, IPTVStream } from "@/types/iptv"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  channel: EnrichedChannel | null
  onClose?: () => void
  onToggleFavorite?: (channelId: string) => void
  isFavorite?: boolean
  className?: string
}

export function VideoPlayer({
  channel,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.9)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTheater, setIsTheater] = useQueryState(
    "theater",
    parseAsBoolean.withDefault(false)
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [selectedStreamIndex, setSelectedStreamIndex] = useQueryState(
    "feed",
    parseAsInteger.withDefault(0)
  )
  const [copied, setCopied] = useState(false)
  const [showStreamMenu, setShowStreamMenu] = useState(false)

  // Reset error during render when channel changes
  const [prevChannelId, setPrevChannelId] = useState(channel?.id)
  if (channel?.id !== prevChannelId) {
    setPrevChannelId(channel?.id)
    setError(null)
  }

  const currentStreamIndex =
    channel?.streams && selectedStreamIndex < channel.streams.length
      ? selectedStreamIndex
      : 0

  const currentStream: IPTVStream | undefined =
    channel?.streams?.[currentStreamIndex] ||
    (channel?.streamUrl
      ? {
          url: channel.streamUrl,
          quality: channel.quality,
          title: "Default Feed",
          channel: channel.id,
        }
      : undefined)

  const noStreamError =
    !currentStream?.url && channel
      ? "This channel does not currently have an active public stream feed."
      : null
  const displayError = error || noStreamError
  const isDisplayLoading = isLoading && !displayError

  // Suppress unhandled AbortErrors from rapid stream switching
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const isAbort =
        reason?.name === "AbortError" ||
        (typeof reason?.message === "string" &&
          (reason.message.includes("interrupted by a new load request") ||
            reason.message.includes("interrupted by a call to pause()")))

      if (isAbort) {
        event.preventDefault()
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  // Safe play helper that catches AbortErrors when channels change rapidly
  const safePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    try {
      const promise = video.play()
      if (promise !== undefined) {
        playPromiseRef.current = promise
        promise
          .then(() => {
            setIsPlaying(true)
            setIsLoading(false)
          })
          .catch((err: unknown) => {
            // AbortError is normal when user switches streams or pauses during load
            if (
              err instanceof Error &&
              (err.name === "AbortError" ||
                err.message?.includes("interrupted") ||
                err.message?.includes("The play() request was interrupted"))
            ) {
              return
            }
            console.warn("Autoplay blocked or stream interrupted:", err)
            setIsPlaying(false)
            setIsLoading(false)
          })
          .finally(() => {
            if (playPromiseRef.current === promise) {
              playPromiseRef.current = null
            }
          })
      }
    } catch (e: unknown) {
      if (
        e instanceof Error &&
        (e.name === "AbortError" || e.message?.includes("interrupted"))
      ) {
        return
      }
      setIsPlaying(false)
      setIsLoading(false)
    }
  }, [])

  // Safe pause helper that waits for any in-flight play request before pausing
  const safePause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          video.pause()
          setIsPlaying(false)
        })
        .catch(() => {
          video.pause()
          setIsPlaying(false)
        })
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [])

  // Load and play stream with lifecycle protection
  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentStream?.url) return

    let isDisposed = false
    setIsLoading(true)
    setError(null)

    // Destroy existing hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const streamUrl = currentStream.url
    const isHls = streamUrl.includes(".m3u8") || streamUrl.includes("m3u")

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      })
      hlsRef.current = hls

      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isDisposed) return
        safePlay()
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (isDisposed) return
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS fatal network error, trying to recover...")
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS fatal media error, trying to recover...")
              hls.recoverMediaError()
              break
            default:
              console.error("HLS unrecoverable error:", data)
              hls.destroy()
              setError(
                "Stream unreachable or restricted. Try an alternative feed or external player."
              )
              setIsLoading(false)
              setIsPlaying(false)
              break
          }
        }
      })

      return () => {
        isDisposed = true
        hls.destroy()
        if (hlsRef.current === hls) {
          hlsRef.current = null
        }
        try {
          video.pause()
          video.removeAttribute("src")
          video.load()
        } catch {
          // Ignore DOMException on reset
        }
      }
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari HLS
      video.src = streamUrl
      const handleMetadata = () => {
        if (isDisposed) return
        safePlay()
      }
      const handleError = () => {
        if (isDisposed) return
        setError("Unable to load video stream natively.")
        setIsLoading(false)
        setIsPlaying(false)
      }
      video.addEventListener("loadedmetadata", handleMetadata)
      video.addEventListener("error", handleError)

      return () => {
        isDisposed = true
        video.removeEventListener("loadedmetadata", handleMetadata)
        video.removeEventListener("error", handleError)
        try {
          video.pause()
          video.removeAttribute("src")
          video.load()
        } catch {
          // Ignore
        }
      }
    } else {
      // Non-HLS direct video
      video.src = streamUrl
      safePlay()

      return () => {
        isDisposed = true
        try {
          video.pause()
          video.removeAttribute("src")
          video.load()
        } catch {
          // Ignore
        }
      }
    }
  }, [currentStream?.url, safePlay])

  // Sync volume & mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      safePlay()
    } else {
      safePause()
    }
  }, [safePlay, safePause])

  // Volume toggle
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true))
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false))
    }
  }, [])

  // Picture in picture
  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture()
      }
    } catch (e) {
      console.warn("PiP failed:", e)
    }
  }, [])

  // Auto hide controls
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3500)
  }

  // Copy Stream URL
  const copyStreamUrl = () => {
    if (!currentStream?.url) return
    navigator.clipboard.writeText(currentStream.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }
      if (e.code === "Space") {
        e.preventDefault()
        togglePlay()
      } else if (e.code === "KeyM") {
        toggleMute()
      } else if (e.code === "KeyF") {
        toggleFullscreen()
      } else if (e.code === "KeyT") {
        setIsTheater((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay, toggleMute, toggleFullscreen, setIsTheater])

  if (!channel) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-950/60 p-12 text-center backdrop-blur-xl ${className}`}
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-900/80 text-zinc-500 shadow-inner ring-1 ring-white/10 mb-4">
          <Tv className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-300 mb-1">
          No Channel Selected
        </h3>
        <p className="max-w-sm text-sm text-zinc-500">
          Select any live channel from the grid or category rows below to start
          watching broadcast feeds instantly.
        </p>
      </div>
    )
  }

  const hasMultipleStreams = (channel.streams?.length || 0) > 1

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`group relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl transition-all duration-300 ${
        isTheater ? "w-full max-w-full" : "w-full"
      } ${className}`}
    >
      {/* Video Element */}
      <div className="relative aspect-video w-full max-h-[calc(100vh-10rem)] max-w-full flex items-center justify-center bg-zinc-950 mx-auto">
        <video
          ref={videoRef}
          playsInline
          onClick={togglePlay}
          className="size-full object-contain cursor-pointer max-h-[calc(100vh-10rem)]"
        />

        {/* Loading Spinner */}
        {isDisplayLoading && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="relative size-12">
              <div className="size-12 rounded-full border-2 border-white/10 border-t-rose-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Radio className="size-4 text-rose-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-3 text-xs font-medium text-zinc-300 tracking-wide uppercase">
              Tuning Live Stream...
            </p>
          </div>
        )}

        {/* Error State */}
        {displayError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 p-6 text-center backdrop-blur-md">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-3">
              <Tv className="size-7" />
            </div>
            <h4 className="text-base font-semibold text-zinc-200 mb-1">
              Stream Temporarily Unavailable
            </h4>
            <p className="max-w-md text-xs text-zinc-400 mb-4">{displayError}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null)
                  setIsLoading(true)
                  if (videoRef.current && currentStream?.url) {
                    videoRef.current.load()
                  }
                }}
                className="border-white/15 bg-white/5 hover:bg-white/10 text-xs"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Retry
              </Button>

              {hasMultipleStreams && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const nextIdx =
                      (currentStreamIndex + 1) % channel.streams.length
                    setSelectedStreamIndex(nextIdx)
                  }}
                  className="text-xs"
                >
                  <Layers className="size-3.5 mr-1" />
                  Try Feed {((currentStreamIndex + 1) % channel.streams.length) + 1}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={copyStreamUrl}
                className="border-white/15 bg-white/5 hover:bg-white/10 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 mr-1 text-emerald-400" />
                    Copied URL
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 mr-1" />
                    Copy Stream URL
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Top Header Bar Overlay */}
        <div
          className={`absolute inset-x-0 top-0 flex items-center justify-between p-4 bg-linear-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-3">
            {channel.logo ? (
              <div className="size-10 overflow-hidden rounded-xl border border-white/15 bg-black/60 p-1 backdrop-blur-md shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-500/20 to-purple-500/20 text-xs font-bold text-zinc-100 border border-white/10">
                {channel.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white drop-shadow-sm text-sm sm:text-base">
                  {channel.name}
                </h3>
                {channel.countryFlag && (
                  <span className="text-base" title={channel.countryName}>
                    {channel.countryFlag}
                  </span>
                )}
                <Badge variant="live" className="text-[10px] px-1.5 py-0">
                  LIVE
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 drop-shadow-sm flex items-center gap-1.5">
                {channel.network && <span>{channel.network} • </span>}
                {channel.categories?.[0] && (
                  <span className="capitalize">{channel.categories[0]}</span>
                )}
                {currentStream?.quality && (
                  <span> • {currentStream.quality}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stream Selector Dropdown */}
            {hasMultipleStreams && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStreamMenu((prev) => !prev)}
                  className="h-8 border-white/15 bg-black/40 backdrop-blur-md hover:bg-white/10 text-xs text-zinc-200"
                >
                  <Layers className="size-3 mr-1" />
                  Feed {currentStreamIndex + 1}/{channel.streams.length}
                </Button>
                {showStreamMenu && (
                  <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-white/15 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-0 duration-150">
                    <p className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Available Feeds
                    </p>
                    {channel.streams.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedStreamIndex(idx)
                          setShowStreamMenu(false)
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          currentStreamIndex === idx
                            ? "bg-rose-500/15 text-rose-400 font-medium"
                            : "text-zinc-300 hover:bg-white/10"
                        }`}
                      >
                        <span className="truncate">
                          {s.title || `Feed ${idx + 1}`}
                        </span>
                        {s.quality && (
                          <span className="text-[10px] text-zinc-400 font-mono ml-1">
                            {s.quality}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={copyStreamUrl}
              title="Copy Stream URL"
              className="size-8 border-white/15 bg-black/40 backdrop-blur-md hover:bg-white/10 text-zinc-200"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>

            {channel.website && (
              <a
                href={channel.website}
                target="_blank"
                rel="noreferrer"
                title="Official Website"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-white/15 bg-black/40 backdrop-blur-md hover:bg-white/10 text-zinc-200 transition-colors"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Center Play Button on Pause */}
        {!isPlaying && !isLoading && !error && (
          <button
            onClick={togglePlay}
            className="group/btn absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/60 backdrop-blur-md shadow-2xl transition-all hover:scale-110 hover:border-white/40 hover:bg-rose-600/90"
          >
            <Play className="size-7 text-white fill-white translate-x-0.5 transition-transform group-hover/btn:scale-105" />
          </button>
        )}

        {/* Bottom Video Controls Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Play/Pause, Volume, Live badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? (
                  <Pause className="size-4 fill-white" />
                ) : (
                  <Play className="size-4 fill-white translate-x-0.5" />
                )}
              </button>

              <div className="flex items-center gap-1.5 group/vol">
                <button
                  onClick={toggleMute}
                  className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                  title="Mute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    setVolume(val)
                    if (isMuted && val > 0) setIsMuted(false)
                  }}
                  className="h-1.5 w-16 sm:w-24 cursor-pointer appearance-none rounded-full bg-white/20 accent-rose-500 hover:bg-white/30"
                />
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] font-semibold text-rose-400">
                <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                LIVE
              </div>
            </div>

            {/* Right: Stream Quality, PiP, Theater, Fullscreen */}
            <div className="flex items-center gap-2">
              {currentStream?.quality && (
                <Badge
                  variant="quality"
                  className="hidden sm:inline-flex text-[11px]"
                >
                  {currentStream.quality}
                </Badge>
              )}

              <button
                onClick={togglePiP}
                className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Picture-in-Picture"
              >
                <PictureInPicture2 className="size-4" />
              </button>

              <button
                onClick={() => setIsTheater((prev) => !prev)}
                className="hidden sm:flex size-8 items-center justify-center rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Theater Mode (T)"
              >
                <Tv className="size-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Fullscreen (F)"
              >
                {isFullscreen ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
