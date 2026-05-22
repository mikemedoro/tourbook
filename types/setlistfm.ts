export interface SetlistFmArtist {
  mbid: string
  name: string
  sortName: string
  disambiguation?: string
  url: string
}

export interface SetlistFmCoords {
  long: number
  lat: number
}

export interface SetlistFmCountry {
  code: string
  name: string
}

export interface SetlistFmCity {
  id: string
  name: string
  state?: string
  stateCode?: string
  coords?: SetlistFmCoords
  country: SetlistFmCountry
}

export interface SetlistFmVenue {
  id: string
  name: string
  city: SetlistFmCity
  url: string
}

export interface SetlistFmSong {
  name: string
  with?: SetlistFmArtist
  cover?: SetlistFmArtist
  info?: string
  tape?: boolean
}

export interface SetlistFmSet {
  name?: string
  encore?: number
  song: SetlistFmSong[]
}

export interface SetlistFmSetlist {
  id: string
  eventDate: string // "DD-MM-YYYY"
  lastUpdated: string
  artist: SetlistFmArtist
  venue: SetlistFmVenue
  sets: { set: SetlistFmSet[] }
  url: string
  info?: string
  tour?: { name: string }
}

export interface SetlistFmArtistSearchResponse {
  type: string
  itemsPerPage: number
  page: number
  total: number
  artist: SetlistFmArtist[]
}

export interface SetlistFmSetlistSearchResponse {
  type: string
  itemsPerPage: number
  page: number
  total: number
  setlist: SetlistFmSetlist[]
}
