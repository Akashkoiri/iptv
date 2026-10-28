import { EnrichedChannel } from "@/types/iptv";

interface AdultChannelConfig {
  slug: string;
  name: string;
  file: string;
  altNames: string[];
  tag: string;
}

const RAW_CHANNELS: AdultChannelConfig[] = [
  {
    slug: "livecams",
    name: "AdultIPTV.net Live Cams",
    file: "livecams.m3u8",
    altNames: ["Live Cams", "Webcams", "Adult Cam"],
    tag: "Live Cams",
  },
  {
    slug: "milf",
    name: "AdultIPTV.net MILF",
    file: "milf.m3u8",
    altNames: ["MILF", "Mature", "Cougar"],
    tag: "MILF",
  },
  {
    slug: "bigdick",
    name: "AdultIPTV.net Big Dick",
    file: "bigdick.m3u8",
    altNames: ["Big Dick", "Male Solo", "Hardcore"],
    tag: "Big Dick",
  },
  {
    slug: "bigtits",
    name: "AdultIPTV.net Big Tits",
    file: "bigtits.m3u8",
    altNames: ["Big Tits", "Busty", "Glamour"],
    tag: "Big Tits",
  },
  {
    slug: "fetish",
    name: "AdultIPTV.net Fetish",
    file: "fetish.m3u8",
    altNames: ["Fetish", "Kink", "BDSM"],
    tag: "Fetish",
  },
  {
    slug: "pornstar",
    name: "AdultIPTV.net Pornstar",
    file: "pornstar.m3u8",
    altNames: ["Pornstar", "Celebrity", "HD Adult"],
    tag: "Pornstar",
  },
  {
    slug: "bigass",
    name: "AdultIPTV.net Big Ass",
    file: "bigass.m3u8",
    altNames: ["Big Ass", "Booty", "Curves"],
    tag: "Big Ass",
  },
  {
    slug: "interracial",
    name: "AdultIPTV.net Interracial",
    file: "interracial.m3u8",
    altNames: ["Interracial", "Couples", "BBC"],
    tag: "Interracial",
  },
  {
    slug: "latina",
    name: "AdultIPTV.net Latina",
    file: "latina.m3u8",
    altNames: ["Latina", "Hispanic", "Latin"],
    tag: "Latina",
  },
  {
    slug: "pov",
    name: "AdultIPTV.net POV",
    file: "pov.m3u8",
    altNames: ["POV", "Point of View", "First Person"],
    tag: "POV",
  },
  {
    slug: "blowjob",
    name: "AdultIPTV.net Blowjob",
    file: "blowjob.m3u8",
    altNames: ["Blowjob", "Oral", "Deepthroat"],
    tag: "Blowjob",
  },
  {
    slug: "hardcore",
    name: "AdultIPTV.net Hardcore",
    file: "hardcore.m3u8",
    altNames: ["Hardcore", "Explicit", "Passionate"],
    tag: "Hardcore",
  },
  {
    slug: "cuckold",
    name: "AdultIPTV.net Cuckold",
    file: "cuckold.m3u8",
    altNames: ["Cuckold", "Hotwife", "Fantasy"],
    tag: "Cuckold",
  },
  {
    slug: "threesome",
    name: "AdultIPTV.net Threesome",
    file: "threesome.m3u8",
    altNames: ["Threesome", "Trio", "Group"],
    tag: "Threesome",
  },
  {
    slug: "russian",
    name: "AdultIPTV.net Russian",
    file: "russian.m3u8",
    altNames: ["Russian", "Slavic", "Eastern Europe"],
    tag: "Russian",
  },
  {
    slug: "lesbian",
    name: "AdultIPTV.net Lesbian",
    file: "lesbian.m3u8",
    altNames: ["Lesbian", "Girls", "WLW"],
    tag: "Lesbian",
  },
  {
    slug: "rough",
    name: "AdultIPTV.net Rough",
    file: "rough.m3u8",
    altNames: ["Rough", "Intense", "Wild"],
    tag: "Rough",
  },
  {
    slug: "gangbang",
    name: "AdultIPTV.net Gangbang",
    file: "gangbang.m3u8",
    altNames: ["Gangbang", "Group Sex", "Orgy"],
    tag: "Gangbang",
  },
  {
    slug: "anal",
    name: "AdultIPTV.net Anal",
    file: "anal.m3u8",
    altNames: ["Anal", "Backdoor", "Hard"],
    tag: "Anal",
  },
  {
    slug: "compilation",
    name: "AdultIPTV.net Compilation",
    file: "compilation.m3u8",
    altNames: ["Compilation", "Best Of", "Mixtape"],
    tag: "Compilation",
  },
  {
    slug: "brunette",
    name: "AdultIPTV.net Brunette",
    file: "brunette.m3u8",
    altNames: ["Brunette", "Brown Hair", "Natural"],
    tag: "Brunette",
  },
  {
    slug: "blonde",
    name: "AdultIPTV.net Blonde",
    file: "blonde.m3u8",
    altNames: ["Blonde", "Golden", "Babe"],
    tag: "Blonde",
  },
  {
    slug: "gay",
    name: "AdultIPTV.net Gay",
    file: "gay.m3u8",
    altNames: ["Gay", "Men", "Male"],
    tag: "Gay",
  },
  {
    slug: "asian",
    name: "AdultIPTV.net Asian",
    file: "asian.m3u8",
    altNames: ["Asian", "Japanese", "Oriental"],
    tag: "Asian",
  },
];

export const ADULT_CHANNELS: EnrichedChannel[] = RAW_CHANNELS.map((item) => {
  const id = `adultiptv-${item.slug}`;
  const httpsUrl = `https://live.adultiptv.net/${item.file}`;
  const httpUrl = `http://live.adultiptv.net/${item.file}`;

  return {
    id,
    name: item.name,
    alt_names: item.altNames,
    network: "AdultIPTV.net",
    country: "US",
    countryName: "United States",
    countryFlag: "🔞",
    categories: ["nsfw", "xxx"],
    is_nsfw: true,
    streamUrl: httpsUrl,
    quality: "1080p",
    labels: ["1080p", "Live", item.tag, "NSFW", "Adult"],
    logo: "/images/adultiptv.svg",
    streams: [
      {
        channel: id,
        title: "Secure HLS (Cloudflare)",
        url: httpsUrl,
        quality: "1080p",
        labels: ["Cloudflare", "HTTPS", "Fast"],
      },
      {
        channel: id,
        title: "Direct HTTP Stream",
        url: httpUrl,
        quality: "1080p",
        labels: ["HTTP", "Direct"],
      },
    ],
  };
});
