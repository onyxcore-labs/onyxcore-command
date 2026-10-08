export function moduleHead(title: string, description: string) {
  return { meta: [
    { title: `${title} — OnyxCore Command Center` },
    { name: 'description', content: description },
    { property: 'og:title', content: `${title} — OnyxCore Labs` },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] };
}