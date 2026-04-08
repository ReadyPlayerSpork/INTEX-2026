import { PortalLayout, type PortalLink } from './PortalLayout'

const LINKS: PortalLink[] = [
  { label: 'Dashboard', to: '/social/dashboard', end: true },
  { label: 'Posts', to: '/social/posts' },
  { label: 'Create Post', to: '/social/post' },
  { label: 'Settings', to: '/account/security' },
]

export function SocialMediaPortalLayout() {
  return <PortalLayout title="Haven for Her" subtitle="Social Media Portal" links={LINKS} />
}
