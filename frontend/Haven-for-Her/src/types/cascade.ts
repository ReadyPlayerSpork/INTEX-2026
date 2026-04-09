export type CascadeImpactAction = 'delete' | 'detach' | 'block'

export interface CascadeImpact {
  label: string
  count: number
  action: CascadeImpactAction
  records: string[]
}
