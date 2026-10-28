import {
  IPTVChannel,
  IPTVStream,
  IPTVLogo,
  IPTVCategory,
  IPTVCountry,
  IPTVLanguage,
  EnrichedChannel,
} from "@/types/iptv";
import { ADULT_CHANNELS } from "@/lib/adult-channels";
import {
  getIptvMateChannels,
  getIptvMateChannelById,
} from "@/lib/iptvmate-service";

const API_BASE = "https://iptv-org.github.io/api";

interface CachedData {
  timestamp: number;
  channels: IPTVChannel[];
  streams: IPTVStream[];
  logos: IPTVLogo[];
  categories: IPTVCategory[];
  countries: IPTVCountry[];
  languages: IPTVLanguage[];
  streamMap: Map<string, IPTVStream[]>;
  logoMap: Map<string, string>;
  countryMap: Map<string, IPTVCountry>;
  categoryMap: Map<string, IPTVCategory>;
  activeChannels: EnrichedChannel[];
}

let cache: CachedData | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours cache

async function fetchJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }
  return res.json();
}

export async function getIPTVData(): Promise<CachedData> {
  const now = performance.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache;
  }

  try {
    const [channels, streams, logos, categories, countries, languages] =
      await Promise.all([
        fetchJson<IPTVChannel[]>("channels.json"),
        fetchJson<IPTVStream[]>("streams.json"),
        fetchJson<IPTVLogo[]>("logos.json"),
        fetchJson<IPTVCategory[]>("categories.json"),
        fetchJson<IPTVCountry[]>("countries.json"),
        fetchJson<IPTVLanguage[]>("languages.json"),
      ]);

    // Build fast lookup maps
    const streamMap = new Map<string, IPTVStream[]>();
    for (const s of streams) {
      if (!s.channel || !s.url) continue;
      if (!streamMap.has(s.channel)) {
        streamMap.set(s.channel, []);
      }
      streamMap.get(s.channel)!.push(s);
    }

    const logoMap = new Map<string, string>();
    for (const l of logos) {
      if (l.channel && l.url && (l.in_use || !logoMap.has(l.channel))) {
        logoMap.set(l.channel, l.url);
      }
    }

    const countryMap = new Map<string, IPTVCountry>();
    for (const c of countries) {
      countryMap.set(c.code.toUpperCase(), c);
    }

    const categoryMap = new Map<string, IPTVCategory>();
    for (const cat of categories) {
      categoryMap.set(cat.id.toLowerCase(), cat);
    }

    // Build enriched active channels (channels with active streams, plus xxx/nsfw channels)
    const activeChannels: EnrichedChannel[] = [];
    for (const ch of channels) {
      const channelStreams = streamMap.get(ch.id);
      const isXxxOrNsfw =
        !!ch.is_nsfw ||
        ch.categories?.some(
          (cat) => cat.toLowerCase() === "xxx" || cat.toLowerCase() === "nsfw"
        );

      // Keep channels with active streams, OR keep xxx/nsfw channels so they are browseable
      if ((!channelStreams || channelStreams.length === 0) && !isXxxOrNsfw) {
        continue;
      }

      // Filter out invalid/closed channels
      if (ch.closed) continue;

      const country = ch.country
        ? countryMap.get(ch.country.toUpperCase())
        : undefined;
      const logo = logoMap.get(ch.id);
      const primaryStream = channelStreams?.[0];

      const cats = ch.categories ? [...ch.categories] : [];
      if (isXxxOrNsfw) {
        if (!cats.some((c) => c.toLowerCase() === "nsfw")) cats.push("nsfw");
        if (!cats.some((c) => c.toLowerCase() === "xxx")) cats.push("xxx");
      }

      activeChannels.push({
        ...ch,
        categories: cats,
        streamUrl: primaryStream?.url || "",
        quality: primaryStream?.quality || undefined,
        labels: primaryStream?.labels || [],
        logo: logo || undefined,
        countryName: country?.name,
        countryFlag: country?.flag,
        streams: channelStreams || [],
      });
    }

    // Prepend custom adult streams and IPTVMate streams so they are fully indexed, searchable, and prioritized
    const iptvMateChannels = await getIptvMateChannels();
    activeChannels.unshift(...iptvMateChannels, ...ADULT_CHANNELS);

    cache = {
      timestamp: now,
      channels,
      streams,
      logos,
      categories,
      countries,
      languages,
      streamMap,
      logoMap,
      countryMap,
      categoryMap,
      activeChannels,
    };

    return cache;
  } catch (error) {
    console.error("Error loading IPTV data:", error);
    if (cache) return cache;
    throw error;
  }
}

export interface ChannelFilters {
  query?: string;
  category?: string;
  country?: string;
  nsfw?: boolean;
  page?: number;
  limit?: number;
  hasLogoOnly?: boolean;
}

export async function searchChannels(filters: ChannelFilters = {}) {
  const data = await getIPTVData();
  const {
    query = "",
    category = "all",
    country = "all",
    nsfw = true,
    page = 1,
    limit = 24,
    hasLogoOnly = false,
  } = filters;

  const q = query.trim().toLowerCase();
  const cat = category.toLowerCase();
  const ctry = country.toUpperCase();

  let results = data.activeChannels;

  // Filter NSFW only if explicitly requested
  if (nsfw === false) {
    results = results.filter((c) => !c.is_nsfw);
  }

  // Filter Category
  if (cat && cat !== "all") {
    results = results.filter((c) =>
      c.categories?.some((catItem) => catItem.toLowerCase() === cat),
    );
  }

  // Filter Country
  if (ctry && ctry !== "ALL") {
    results = results.filter((c) => c.country?.toUpperCase() === ctry);
  }

  // Filter with logo only
  if (hasLogoOnly) {
    results = results.filter((c) => !!c.logo);
  }

  // Search query
  if (q) {
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.network?.toLowerCase().includes(q) ||
        c.countryName?.toLowerCase().includes(q) ||
        c.alt_names?.some((alt) => alt.toLowerCase().includes(q)),
    );
  }

  // Sort channels: prioritize channels with active streams, then logos and HD streams
  results.sort((a, b) => {
    const aHasStream = !!a.streamUrl;
    const bHasStream = !!b.streamUrl;
    if (aHasStream && !bHasStream) return -1;
    if (!aHasStream && bHasStream) return 1;

    // If one has a logo and the other doesn't
    if (a.logo && !b.logo) return -1;
    if (!a.logo && b.logo) return 1;
    // Prioritize 1080p, 720p
    const qRank = (q?: string) => {
      if (!q) return 0;
      if (q.includes("1080") || q.includes("4K")) return 3;
      if (q.includes("720")) return 2;
      if (q.includes("480")) return 1;
      return 0;
    };
    const diff = qRank(b.quality) - qRank(a.quality);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginated = results.slice(offset, offset + limit);

  return {
    channels: paginated,
    total,
    page,
    totalPages,
    limit,
  };
}

export async function getChannelById(
  id: string,
): Promise<EnrichedChannel | null> {
  const iptvMate = await getIptvMateChannelById(id);
  if (iptvMate) return iptvMate;
  const custom = ADULT_CHANNELS.find(
    (c) => c.id.toLowerCase() === id.toLowerCase(),
  );
  if (custom) return custom;
  const data = await getIPTVData();
  const found = data.activeChannels.find(
    (c) => c.id.toLowerCase() === id.toLowerCase(),
  );
  return found || null;
}

export async function getPopularCategories() {
  const data = await getIPTVData();
  const counts = new Map<string, number>();
  for (const c of data.activeChannels) {
    if (c.categories) {
      for (const cat of c.categories) {
        const lower = cat.toLowerCase();
        counts.set(lower, (counts.get(lower) || 0) + 1);
      }
    }
  }

  const allCats = [...data.categories];
  if (!allCats.some((c) => c.id.toLowerCase() === "nsfw")) {
    allCats.push({
      id: "nsfw",
      name: "NSFW",
      description: "Not Safe For Work adult streams and explicit live broadcasts",
    });
  }
  if (!allCats.some((c) => c.id.toLowerCase() === "xxx")) {
    allCats.push({
      id: "xxx",
      name: "XXX",
      description: "Programming is adult oriented and x-rated",
    });
  }
  if (!allCats.some((c) => c.id.toLowerCase() === "iptvmate")) {
    allCats.push({
      id: "iptvmate",
      name: "IPTVMate",
      description: "Live interactive feeds & cams from IPTVMate",
    });
  }

  const categoryList = allCats
    .map((cat) => {
      const lower = cat.id.toLowerCase();
      let count = counts.get(lower) || 0;
      if (count === 0 && (lower === "nsfw" || lower === "xxx")) {
        count = ADULT_CHANNELS.length;
      }
      return {
        ...cat,
        count,
      };
    })
    .filter((cat) => {
      const lower = cat.id.toLowerCase();
      return cat.count > 0 || lower === "nsfw" || lower === "xxx";
    })
    .sort((a, b) => b.count - a.count);

  return categoryList;
}

export async function getAvailableCountries() {
  const data = await getIPTVData();
  const counts = new Map<string, number>();
  for (const c of data.activeChannels) {
    if (c.country) {
      const code = c.country.toUpperCase();
      counts.set(code, (counts.get(code) || 0) + 1);
    }
  }

  const countryList = data.countries
    .map((c) => ({
      ...c,
      count: counts.get(c.code.toUpperCase()) || 0,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return countryList;
}

export async function getFeaturedChannels(): Promise<{
  hero: EnrichedChannel | null;
  news: EnrichedChannel[];
  sports: EnrichedChannel[];
  movies: EnrichedChannel[];
  music: EnrichedChannel[];
  animation: EnrichedChannel[];
  xxx: EnrichedChannel[];
  iptvmate: EnrichedChannel[];
}> {
  const data = await getIPTVData();
  const withLogo = data.activeChannels.filter((c) => c.logo && !c.is_nsfw);

  // Pick popular channels with reliable streams
  const findTop = (categoryName: string, limit = 8) => {
    return withLogo
      .filter((c) =>
        c.categories?.some(
          (cat) => cat.toLowerCase() === categoryName.toLowerCase(),
        ),
      )
      .slice(0, limit);
  };

  const news = findTop("news", 10);
  const sports = findTop("sports", 10);
  const movies = findTop("movies", 10);
  const music = findTop("music", 10);
  const animation = findTop("animation", 10);
  const xxx = ADULT_CHANNELS;
  const iptvmate = await getIptvMateChannels();

  // Hero channel: pick an HD news or entertainment channel with good logo
  const heroCandidate =
    news.find(
      (c) => c.quality?.includes("1080") || c.quality?.includes("720"),
    ) ||
    withLogo.find((c) => c.quality?.includes("1080")) ||
    withLogo[0] ||
    null;

  return {
    hero: heroCandidate,
    news,
    sports,
    movies,
    music,
    animation,
    xxx,
    iptvmate,
  };
}
