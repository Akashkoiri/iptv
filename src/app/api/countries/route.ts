import { NextResponse } from "next/server"
import { getAvailableCountries } from "@/lib/iptv-service"

export async function GET() {
  try {
    const countries = await getAvailableCountries()
    return NextResponse.json(countries)
  } catch (error) {
    console.error("Countries API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    )
  }
}
