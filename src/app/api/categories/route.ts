import { NextResponse } from "next/server"
import { getPopularCategories } from "@/lib/iptv-service"

export async function GET() {
  try {
    const categories = await getPopularCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
