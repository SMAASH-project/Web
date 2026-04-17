import miVagyunkUrl from "@/assets/ostTracks/mi-vagyunk-magyar-peter.mp3?url";
import tipTipUrl from "@/assets/ostTracks/tip-tip.mp3?url";

export interface OstTrack {
  id: number;
  title: string;
  artist: string;
  src: string;
  durationLabel?: string;
}

export const OST_TRACKS: OstTrack[] = [
  {
    id: 1,
    title: "Mi vagyunk Magyar Péter",
    artist: "SMAASH OST",
    src: miVagyunkUrl,
  },
  {
    id: 2,
    title: "Tip Tip",
    artist: "Desh x Young Fly x Azahriah",
    src: tipTipUrl,
  },
];
