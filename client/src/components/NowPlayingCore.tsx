import React, { useEffect, useMemo, useRef, useState } from "react";


/** Data contracts (keep simple + swappable) */
export type Track = {
title: string;
artist: string;
startedAt?: string; // ISO
endsAt?: string; // ISO
};


export type NowPlayingPayload = {
now: Track | null;
next: Track | null;
// optional raw payload for debugging
_raw?: any;
};


/**
* Minimal fetcher that expects JSON shaped like NowPlayingPayload.
* If your backend returns a different shape, adapt in the mapPayload() fn below.
*/
async function fetchNowPlaying(url: string): Promise<NowPlayingPayload> {
const res = await fetch(url, { cache: "no-store" });
const json = await res.json();
return mapPayload(json);
}


/**
* Adapter: map arbitrary API → NowPlayingPayload
* Edit this once to match Radio.co (or your own endpoint) structure.
*/
function mapPayload(json: any): NowPlayingPayload {
// Example accepted shapes:
// 1) Already in desired contract
if (json?.now || json?.next) return { now: json.now ?? null, next: json.next ?? null, _raw: json };


// 2) Generic { current: { song, artist }, upcoming: { song, artist } }
if (json?.current || json?.upcoming) {
return {
now: json.current
? { title: json.current.song ?? json.current.title ?? "", artist: json.current.artist ?? "" }
: null,
next: json.upcoming
? { title: json.upcoming.song ?? json.upcoming.title ?? "", artist: json.upcoming.artist ?? "" }
: null,
_raw: json,
};
}


// 3) Fallback unknown → nulls
return { now: null, next: null, _raw: json };
}


/** Small helper to format “Title — Artist” */
function formatTrack(t?: Track | null) {
if (!t) return "—";
const tPart = t.title?.trim() || "Untitled";
const aPart = t.artist?.trim() || "Unknown";
return `${tPart} — ${aPart}`;
}


/** Auto-ellipsis with optional hover-reveal */
function LineClamp({ children }: { children: React.ReactNode }) {
return (
<div className="truncate md:max-w-[42rem] lg:max-w-[56rem]" title={String(children)}>
{children}
}