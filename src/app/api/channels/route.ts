import { NextRequest, NextResponse } from "next/server"
import { searchChannels } from "@/lib/iptv-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const category = searchParams.get("category") || "all"
    const country = searchParams.get("country") || "all"
    const nsfw = searchParams.has("nsfw")
      ? searchParams.get("nsfw") === "true"
      : undefined
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "24", 10)
    const hasLogoOnly = searchParams.get("hasLogoOnly") === "true"

    const results = await searchChannels({
      query,
      category,
      country,
      nsfw,
      page,
      limit,
      hasLogoOnly,
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Channels API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    )
  }
}
