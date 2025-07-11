type Prediction = {
  compound: { commune: string; district: string; province: string }
  description: string
  distance_meters: number
  has_children: false
  matched_substrings: { length: number; offset: number }[]
  place_id: string
  plus_code: { compound_code: string; global_code: string }
  reference: string
  structured_formatting: {
    main_text: string
    main_text_matched_substrings: { length: number; offset: number }[]
    secondary_text: string
    secondary_text_matched_substrings: { length: number; offset: number }[]
  }
  terms: { offset: number; value: string }[]
  type: string[]
}
type Location = {
  place_id: string
  formatted_address: string
  geometry: { location: { lat: number; lng: number } }
  name: string
}

export type SearchLocationAPIResponse = {
  execution_time: string
  predictions: Prediction[]
  status: string
}

export type LocationDetailAPIResponse = {
  result: Location
  status: string
}
