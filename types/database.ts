export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
      shows: {
        Row: {
          id: string
          user_id: string
          artist_name: string
          artist_mbid: string | null
          artist_setlistfm_id: string | null
          venue_name: string
          venue_city: string
          venue_state: string | null
          venue_country: string
          venue_lat: number | null
          venue_lng: number | null
          show_date: string
          setlist_id: string | null
          overall_rating: number | null
          sound_rating: number | null
          crowd_rating: number | null
          setlist_rating: number | null
          venue_rating: number | null
          notes: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          artist_name: string
          artist_mbid?: string | null
          artist_setlistfm_id?: string | null
          venue_name: string
          venue_city: string
          venue_state?: string | null
          venue_country: string
          venue_lat?: number | null
          venue_lng?: number | null
          show_date: string
          setlist_id?: string | null
          overall_rating?: number | null
          sound_rating?: number | null
          crowd_rating?: number | null
          setlist_rating?: number | null
          venue_rating?: number | null
          notes?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          artist_name?: string
          artist_mbid?: string | null
          artist_setlistfm_id?: string | null
          venue_name?: string
          venue_city?: string
          venue_state?: string | null
          venue_country?: string
          venue_lat?: number | null
          venue_lng?: number | null
          show_date?: string
          setlist_id?: string | null
          overall_rating?: number | null
          sound_rating?: number | null
          crowd_rating?: number | null
          setlist_rating?: number | null
          venue_rating?: number | null
          notes?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
      setlist_songs: {
        Row: {
          id: string
          show_id: string
          song_name: string
          position: number
          is_encore: boolean
          is_highlighted: boolean
        }
        Insert: {
          id?: string
          show_id: string
          song_name: string
          position: number
          is_encore?: boolean
          is_highlighted?: boolean
        }
        Update: {
          id?: string
          show_id?: string
          song_name?: string
          position?: number
          is_encore?: boolean
          is_highlighted?: boolean
        }
      }
      show_photos: {
        Row: {
          id: string
          show_id: string
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          show_id: string
          storage_path: string
          created_at?: string
        }
        Update: {
          id?: string
          show_id?: string
          storage_path?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      artist_genres: {
        Row: {
          artist_mbid: string
          artist_name: string
          genres: string[]
          updated_at: string
        }
        Insert: {
          artist_mbid: string
          artist_name: string
          genres?: string[]
          updated_at?: string
        }
        Update: {
          artist_mbid?: string
          artist_name?: string
          genres?: string[]
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Show = Database['public']['Tables']['shows']['Row']
export type SetlistSong = Database['public']['Tables']['setlist_songs']['Row']
export type ShowPhoto = Database['public']['Tables']['show_photos']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type ArtistGenre = Database['public']['Tables']['artist_genres']['Row']

export type ShowWithSongs = Show & {
  setlist_songs: SetlistSong[]
  show_photos: ShowPhoto[]
  profiles: Pick<Profile, 'username' | 'avatar_url'>
}
