"use client"

import React from "react"
import { Globe, LayoutGrid, List, Sparkles, Check } from "lucide-react"
import { IPTVCountry } from "@/types/iptv"

interface FilterToolbarProps {
  selectedCountry: string
  onSelectCountry: (code: string) => void
  countries: IPTVCountry[]
  hasLogoOnly: boolean
  setHasLogoOnly: (val: boolean) => void
  viewMode: "grid" | "list"
  setViewMode: (val: "grid" | "list") => void
  totalCount: number
}

// Popular countries to prioritize in the dropdown
const POPULAR_COUNTRY_CODES = [
  "US",
  "GB",
  "CA",
  "FR",
  "DE",
  "IN",
  "JP",
  "ES",
  "IT",
  "BR",
  "AU",
  "MX",
  "TR",
  "RU",
  "KR",
  "CN",
]

export function FilterToolbar({
  selectedCountry,
  onSelectCountry,
  countries,
  hasLogoOnly,
  setHasLogoOnly,
  viewMode,
  setViewMode,
  totalCount,
}: FilterToolbarProps) {
  // Sort popular first
  const sortedCountries = [...countries].sort((a, b) => {
    const aPop = POPULAR_COUNTRY_CODES.indexOf(a.code)
    const bPop = POPULAR_COUNTRY_CODES.indexOf(b.code)
    if (aPop !== -1 && bPop !== -1) return aPop - bPop
    if (aPop !== -1) return -1
    if (bPop !== -1) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-white/[0.06] my-3">
      {/* Left: Country Selector & Logo filter */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Country Selector */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] px-3.5 py-1.5 text-xs text-zinc-200 transition-all">
            <Globe className="size-3.5 text-zinc-400" />
            <select
              value={selectedCountry}
              onChange={(e) => onSelectCountry(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#0e1017] text-zinc-100">
                All Countries
              </option>
              {sortedCountries.map((c) => (
                <option
                  key={c.code}
                  value={c.code}
                  className="bg-[#0e1017] text-zinc-100"
                >
                  {c.flag || "🏳️"} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Toggle: Logo Only */}
        <button
          onClick={() => setHasLogoOnly(!hasLogoOnly)}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border cursor-pointer ${
            hasLogoOnly
              ? "border-white/20 bg-white/10 text-white shadow-xs"
              : "border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08]"
          }`}
        >
          <Sparkles className="size-3.5" />
          <span>Verified Logos</span>
          {hasLogoOnly && <Check className="size-3 text-emerald-400 ml-0.5" />}
        </button>
      </div>

      {/* Right: Results Count & View Mode */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400 font-medium">
          <strong className="text-zinc-200 font-semibold font-mono">
            {totalCount.toLocaleString()}
          </strong>{" "}
          Channels
        </span>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            title="Grid View"
            className={`flex size-7 items-center justify-center rounded-full transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white text-zinc-950 shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            title="List View"
            className={`flex size-7 items-center justify-center rounded-full transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-white text-zinc-950 shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
