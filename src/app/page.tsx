import { Suspense } from "react"
import {
  getFeaturedChannels,
  getAvailableCountries,
  searchChannels,
  getPopularCategories,
} from "@/lib/iptv-service"
import { StreamingApp } from "@/components/streaming-app"

export default async function Home() {
  const [featured, countries, initialChannels, categories] = await Promise.all([
    getFeaturedChannels(),
    getAvailableCountries(),
    searchChannels({ page: 1, limit: 24, hasLogoOnly: false }),
    getPopularCategories(),
  ])

  return (
    <Suspense>
      <StreamingApp
        initialFeatured={featured}
        initialCountries={countries}
        initialChannels={initialChannels}
        initialCategories={categories}
      />
    </Suspense>
  )
}
