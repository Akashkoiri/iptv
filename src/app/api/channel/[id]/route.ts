import { NextRequest, NextResponse } from "next/server"
import { getChannelById } from "@/lib/iptv-service"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const channel = await getChannelById(id)
    if (!channel) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(channel)
  } catch (error) {
    console.error("Channel detail API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch channel detail" },
      { status: 500 }
    )
  }
}
