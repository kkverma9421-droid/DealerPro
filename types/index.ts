export type PropertyStatus = 'available' | 'sold' | 'hold' | 'requirement'

export interface PropertyImage {
  id:           string
  property_id:  string
  image_url:    string
  is_primary:   boolean
  sort_order:   number
}

export interface Property {
  id:            string
  property_id:   string
  title:         string
  description?:  string
  city:          string
  locality:      string
  price:         number
  property_type: string
  area?:         number
  bedrooms?:     number
  owner_name:    string
  owner_phone?:  string
  status:        PropertyStatus
  featured:      boolean
  latitude?:     number
  longitude?:    number
  created_by?:   string
  created_at:    string
  updated_at:    string
  property_images?: PropertyImage[]
}

export interface User {
  id:              string
  full_name:       string
  email:           string
  phone?:          string
  company_name?:   string
  role:            'admin' | 'dealer' | 'staff'
  approval_status: 'pending' | 'approved' | 'suspended'
  created_at:      string
}

export type LeadStage = 'new_inquiry' | 'contacted' | 'visit_scheduled' | 'negotiation' | 'closed' | 'lost'

export interface Lead {
  id:                  string
  lead_number:         string
  client_name:         string
  client_phone?:       string
  client_email?:       string
  budget_min?:         number
  budget_max?:         number
  preferred_location?: string
  preferred_type?:     string
  property_interest?:  string
  stage:               LeadStage
  source:              string
  priority:            'low' | 'medium' | 'high' | 'urgent'
  assigned_to?:        string
  follow_up_date?:     string
  last_contacted?:     string
  notes?:              string
  created_at:          string
  updated_at:          string
}
