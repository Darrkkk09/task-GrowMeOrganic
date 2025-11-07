import { z } from "zod";

export interface Artwork {
  id: number;
  title: string;
  place_of_origin: string | null;
  artist_display: string | null;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
}

export interface ApiResponse {
  data: Artwork[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  };
}

export const artworkSchema = z.object({
  id: z.number(),
  title: z.string(),
  place_of_origin: z.string().nullable(),
  artist_display: z.string().nullable(),
  inscriptions: z.string().nullable(),
  date_start: z.number().nullable(),
  date_end: z.number().nullable(),
});

export type ArtworkType = z.infer<typeof artworkSchema>;
