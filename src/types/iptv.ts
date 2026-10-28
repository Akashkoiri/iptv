export interface IPTVChannel {
  id: string
  name: string
  alt_names?: string[]
  network?: string | null
  owners?: string[]
  country?: string
  categories?: string[]
  is_nsfw?: boolean
  launched?: string | null
  closed?: string | null
  replaced_by?: string | null
  website?: string | null
}

export interface IPTVStream {
  channel: string | null
  feed?: string | null
  title?: string
  url: string
  quality?: string | null
  labels?: string[]
  user_agent?: string | null
  referrer?: string | null
}

export interface IPTVLogo {
  channel: string
  feed?: string | null
  in_use?: boolean
  tags?: string[]
  width?: number
  height?: number
  format?: string
  url: string
}

export interface IPTVCategory {
  id: string
  name: string
  description: string
}

export interface IPTVCountry {
  name: string
  code: string
  languages: string[]
  flag: string
}

export interface IPTVLanguage {
  name: string
  code: string
}

export interface IPTVGuide {
  channel: string | null
  feed?: string | null
  site: string
  site_id: string
  site_name: string
  lang: string
  sources: {
    host: string
    url: string
    format: string
  }[]
}

export interface EnrichedChannel extends IPTVChannel {
  streamUrl: string
  quality?: string
  labels?: string[]
  logo?: string
  countryName?: string
  countryFlag?: string
  streams: IPTVStream[]
}
