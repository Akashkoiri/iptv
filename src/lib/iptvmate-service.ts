import { EnrichedChannel } from "@/types/iptv";

export const IPTVMATE_M3U_URL = "https://iptvmate.net/files/xxx.m3u";

// Pre-configured fallback channels matching https://iptvmate.net/files/xxx.m3u
const FALLBACK_RAW_ENTRIES: Array<{ title: string; url: string }> = [
  { title: "MyCamTV Teen Girls", url: "https://live.mycamtv.com/teen.m3u8" },
  { title: "MyCamTV MILF", url: "https://live.mycamtv.com/milf.m3u8" },
  { title: "MyCamTV Young Girls", url: "https://live.mycamtv.com/young.m3u8" },
  { title: "MyCamTV Mature", url: "https://live.mycamtv.com/bigtits.m3u8" },
  { title: "MyCamTV Arab Girls", url: "https://live.mycamtv.com/arab.m3u8" },
  { title: "MyCamTV Ebony Girls", url: "https://live.mycamtv.com/ebony.m3u8" },
  { title: "MyCamTV Asian Girls", url: "https://live.mycamtv.com/asian.m3u8" },
  { title: "MyCamTV Brunette Girls", url: "https://live.mycamtv.com/brunette.m3u8" },
  { title: "MyCamTV Latina Girls", url: "https://live.mycamtv.com/latina.m3u8" },
  { title: "MyCamTV White Girls", url: "https://live.mycamtv.com/white.m3u8" },
  { title: "MyCamTV Blonde Girls", url: "https://live.mycamtv.com/blonde.m3u8" },
  { title: "MyCamTV Anal", url: "https://live.mycamtv.com/anal.m3u8" },
  { title: "MyCamTV Big Ass Girls", url: "https://live.mycamtv.com/bigass.m3u8" },
  { title: "MyCamTV Girls Squirt", url: "https://live.mycamtv.com/squirt.m3u8" },
  { title: "MyCamTV Big Tits Girls", url: "https://live.mycamtv.com/bigtits.m3u8" },
  { title: "MyCamTV Skinny Girls", url: "https://live.mycamtv.com/skinny.m3u8" },
  { title: "MyCamTV Medium Girls", url: "https://live.mycamtv.com/medium.m3u8" },
  { title: "MyCamTV Blowjob", url: "https://live.mycamtv.com/blowjob.m3u8" },
  { title: "XXX Live Cams", url: "https://play.iptvxxx.net/livecams.m3u8" },
  { title: "XXX MILF", url: "https://play.iptvxxx.net/milf.m3u8" },
  { title: "XXX Big Dick", url: "https://play.iptvxxx.net/bigdick.m3u8" },
  { title: "XXX Big Tits", url: "https://play.iptvxxx.net/bigtits.m3u8" },
  { title: "XXX Fetish", url: "https://play.iptvxxx.net/fetish.m3u8" },
  { title: "XXX Pornstar", url: "https://play.iptvxxx.net/pornstar.m3u8" },
  { title: "XXX Big Ass", url: "https://play.iptvxxx.net/bigass.m3u8" },
  { title: "XXX Interracial", url: "https://play.iptvxxx.net/interracial.m3u8" },
  { title: "XXX Latina", url: "https://play.iptvxxx.net/latina.m3u8" },
  { title: "XXX POV", url: "https://play.iptvxxx.net/pov.m3u8" },
  { title: "XXX Blowjob", url: "https://play.iptvxxx.net/blowjob.m3u8" },
  { title: "XXX Teen", url: "https://play.iptvxxx.net/teen.m3u8" },
  { title: "XXX Hardcore", url: "https://play.iptvxxx.net/hardcore.m3u8" },
  { title: "XXX Cuckold", url: "https://play.iptvxxx.net/cuckold.m3u8" },
  { title: "XXX Threesome", url: "https://play.iptvxxx.net/threesome.m3u8" },
  { title: "XXX Russian", url: "https://play.iptvxxx.net/russian.m3u8" },
  { title: "XXX Lesbian", url: "https://play.iptvxxx.net/lesbian.m3u8" },
  { title: "XXX Rough", url: "https://play.iptvxxx.net/rough.m3u8" },
  { title: "XXX Gangbang", url: "https://play.iptvxxx.net/gangbang.m3u8" },
  { title: "XXX Anal", url: "https://play.iptvxxx.net/anal.m3u8" },
  { title: "XXX Compilation", url: "https://play.iptvxxx.net/compilation.m3u8" },
  { title: "XXX Brunette", url: "https://play.iptvxxx.net/brunette.m3u8" },
  { title: "XXX Blonde", url: "https://play.iptvxxx.net/blonde.m3u8" },
  { title: "XXX Gay", url: "https://play.iptvxxx.net/gay.m3u8" },
];

function parseM3UToEntries(m3uContent: string): Array<{ title: string; url: string }> {
  const lines = m3uContent.split(/\r?\n/);
  const entries: Array<{ title: string; url: string }> = [];

  let currentTitle = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      const commaIndex = line.indexOf(",");
      if (commaIndex !== -1) {
        currentTitle = line.slice(commaIndex + 1).trim();
      } else {
        currentTitle = line.replace(/#EXTINF:[^,]*,?/i, "").trim();
      }
    } else if (!line.startsWith("#") && (line.startsWith("http://") || line.startsWith("https://"))) {
      if (currentTitle) {
        entries.push({
          title: currentTitle,
          url: line,
        });
        currentTitle = "";
      }
    }
  }

  return entries;
}

function convertEntryToChannel(
  entry: { title: string; url: string },
  index: number
): EnrichedChannel {
  const cleanTitle = entry.title.trim();
  const slug = cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const id = `iptvmate-${slug || index}`;

  let network = "IPTVMate";
  let logo = "/images/iptvmate.svg";
  let tag = "Adult";

  if (/mycamtv/i.test(cleanTitle)) {
    network = "MyCamTV";
    logo = "/images/mycamtv.svg";
    tag = cleanTitle.replace(/mycamtv/i, "").trim() || "Live Cams";
  } else if (/xxx/i.test(cleanTitle)) {
    network = "IPTVXXX";
    logo = "/images/iptvxxx.svg";
    tag = cleanTitle.replace(/xxx/i, "").trim() || "Adult";
  }

  // Ensure both HTTPS and HTTP streams are provided
  const rawUrl = entry.url.trim();
  const httpsUrl = rawUrl.startsWith("http://") ? rawUrl.replace("http://", "https://") : rawUrl;
  const httpUrl = rawUrl.startsWith("https://") ? rawUrl.replace("https://", "http://") : rawUrl;

  const altNames = [
    cleanTitle,
    tag,
    `${network} Feed`,
    "IPTVMate Live",
  ];

  return {
    id,
    name: cleanTitle,
    alt_names: altNames,
    network: network,
    country: "US",
    countryName: "United States",
    countryFlag: "🔞",
    categories: ["nsfw", "xxx", "iptvmate"],
    is_nsfw: true,
    streamUrl: httpsUrl,
    quality: "1080p HD",
    labels: ["1080p", "Live", "HLS", network, tag, "18+"],
    logo,
    streams: [
      {
        channel: id,
        title: "Secure HLS Stream (Cloudflare/HTTPS)",
        url: httpsUrl,
        quality: "1080p",
        labels: ["HTTPS", "Direct", "Low-Latency"],
      },
      {
        channel: id,
        title: "Standard Stream Feed (HTTP)",
        url: httpUrl,
        quality: "1080p",
        labels: ["HTTP", "Fallback"],
      },
    ],
  };
}

let cachedChannels: EnrichedChannel[] | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function getIptvMateChannels(forceRefresh = false): Promise<EnrichedChannel[]> {
  const now = Date.now();
  if (!forceRefresh && cachedChannels && now - cacheTime < CACHE_TTL_MS) {
    return cachedChannels;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(IPTVMATE_M3U_URL, {
      signal: controller.signal,
      next: { revalidate: 900 },
      headers: {
        "User-Agent": "PulseTV/1.0 (+https://pulsetv.live)",
        Accept: "*/*",
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      const entries = parseM3UToEntries(text);
      if (entries.length > 0) {
        cachedChannels = entries.map(convertEntryToChannel);
        cacheTime = now;
        return cachedChannels;
      }
    }
  } catch (err) {
    console.warn("Could not fetch latest iptvmate m3u playlist, using fallback:", err);
  }

  // Fallback to static pre-configured entries
  cachedChannels = FALLBACK_RAW_ENTRIES.map(convertEntryToChannel);
  cacheTime = now;
  return cachedChannels;
}

export async function getIptvMateChannelById(id: string): Promise<EnrichedChannel | null> {
  const channels = await getIptvMateChannels();
  const lower = id.toLowerCase();
  return channels.find((c) => c.id.toLowerCase() === lower) || null;
}
