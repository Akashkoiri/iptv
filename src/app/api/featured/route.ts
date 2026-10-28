import { NextResponse } from "next/server"
import { getFeaturedChannels } from "@/lib/iptv-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const featured = await getFeaturedChannels()
    return NextResponse.json(featured)
  } catch (error) {
    console.error("Featured API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured channels" },
      { status: 500 }
    )
  }
}
