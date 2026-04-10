import { useAuth } from '@/hooks/useAuth'
import { getVisiblePortalSections } from '@/components/portal-nav-sections'
import { PortalLayout, type PortalSection } from './PortalLayout'

export function RolePortalLayout() {
  const { isAuthenticated, hasRole } = useAuth()

  const navSections = getVisiblePortalSections(isAuthenticated, hasRole)

  if (!navSections || navSections.length === 0) {
    return null
  }

  const sections: PortalSection[] = navSections.map((sec) => ({
    title: sec.heading,
    links: sec.items,
  }))

  return <PortalLayout title="Haven for Her" sections={sections} />
}
