export type TabItem = {
  label: string
  name: string
  path: string
  icon: string
  iconActive: string // Add this property
  badge?: number | string | undefined
}
