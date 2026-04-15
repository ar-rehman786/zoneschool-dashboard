export interface Lead {
  id: string
  urgency_level: 'Hot' | 'Warm' | 'Cold'
  sentiment_score: number
  problem_description: string
  bottlenecks: string
  fears: string
  desires: string
  lead_summary: string
  timestamp: string
  name: string
  email: string
  past_investment: string
  tried_before: string
  success_definition: string
  identity_transformation: string
  service_preference: string
  key_phrase: string
  is_active_client: boolean
  stance: 'Committed' | 'Skeptical' | 'Burned'
  drive_type: 'Healer' | 'Builder' | 'Teacher'
  core_motivation: 'Patient Results' | 'Practice Growth' | 'Personal Mastery'
  identity_tags: string[]
  sales_strategy: string
}
