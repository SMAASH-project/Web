export interface OstTrack {
  id: number;
  title: string;
  artist: string;
  src: string;
  durationLabel?: string;
}

export const OST_TRACKS: OstTrack[] = [];
