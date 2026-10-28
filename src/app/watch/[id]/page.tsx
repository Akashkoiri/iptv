import { Suspense } from "react"
import { Metadata } from "next"
import Link from "next/link"
import { getChannelById, searchChannels, getFeaturedChannels } from "@/lib/iptv-service"
import { WatchChannelView } from "@/components/player/watch-channel-view"
import { Header } from "@/components/layout/header"
import { Tv, ArrowLeft } from "lucide-react"
import { EnrichedChannel } from "@/types/iptv"

interface WatchPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { id } = await params
  const decodedId = decodeURIComponent(id)
  const channel = await getChannelById(decodedId)

  if (!channel) {
    return {
      title: "Channel Not Found — PulseTV",
    }
  }

  return {
    title: `${channel.name} — Live Stream Broadcast | PulseTV`,
    description: `Watch live broadcast feed of ${channel.name}${
      channel.countryName ? ` from ${channel.countryName}` : ""
    }. Instant zero-buffer HLS live stream on PulseTV.`,
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params
  const decodedId = decodeURIComponent(id)
  const channel = await getChannelById(decodedId)

  if (!channel) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Header />
        <main className="container mx-auto max-w-7xl flex-1 px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-4">
            <Tv className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Channel Not Found
          </h1>
          <p className="max-w-md text-sm text-zinc-400 mb-6">
            We could not find an active broadcast feed for{" "}
            <span className="font-mono text-zinc-300 font-semibold">
              &quot;{decodedId}&quot;
            </span>
            . The stream might have gone offline or the identifier changed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="size-4 mr-2" />
            Return to All Channels
          </Link>
        </main>
      </div>
    )
  }

  // Fetch related channels (same category or top channels)
  const primaryCategory = channel.categories?.[0]
  let related: EnrichedChannel[] = []
  if (primaryCategory) {
    const searchRes = await searchChannels({
      category: primaryCategory,
      limit: 13,
      hasLogoOnly: true,
    })
    related = searchRes.channels.filter((c) => c.id !== channel.id).slice(0, 12)
  }

  if (related.length < 6) {
    const featured = await getFeaturedChannels()
    const isAdult = channel.categories?.some(
      (c) => c.toLowerCase() === "xxx" || c.toLowerCase() === "iptvmate"
    )
    const pool = isAdult
      ? [...(featured.iptvmate || []), ...(featured.xxx || [])]
      : [
          ...featured.news,
          ...featured.sports,
          ...featured.movies,
          ...featured.music,
        ]
    const additional = pool.filter(
      (c) => c.id !== channel.id && !related.some((r) => r.id === c.id)
    )
    related = [...related, ...additional].slice(0, 12)
  }

  return (
    <Suspense>
      <WatchChannelView channel={channel} relatedChannels={related} />
    </Suspense>
  )
}
