import { NextRequest, NextResponse } from "next/server";
import { getIptvMateChannels } from "@/lib/iptvmate-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";
    const query = searchParams.get("query")?.toLowerCase();
    const tag = searchParams.get("tag")?.toLowerCase();
    const provider = searchParams.get("provider")?.toLowerCase();

    let channels = await getIptvMateChannels(refresh);

    if (provider && provider !== "all") {
      channels = channels.filter(
        (c) => c.network && c.network.toLowerCase() === provider
      );
    }

    if (tag && tag !== "all") {
      channels = channels.filter(
        (c) =>
          c.name.toLowerCase().includes(tag) ||
          c.labels?.some((lbl) => lbl.toLowerCase().includes(tag))
      );
    }

    if (query) {
      channels = channels.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.alt_names?.some((alt) => alt.toLowerCase().includes(query)) ||
          c.labels?.some((lbl) => lbl.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({
      source: "https://iptvmate.net/files/xxx.m3u",
      total: channels.length,
      channels,
    });
  } catch (error) {
    console.error("IPTVMate API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch IPTVMate streams" },
      { status: 500 }
    );
  }
}
