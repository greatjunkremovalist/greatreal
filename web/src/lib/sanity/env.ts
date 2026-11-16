export const projectId = (import.meta.env.VITE_SANITY_PROJECT_ID as string) || 'fe0jyhek'
export const dataset = (import.meta.env.VITE_SANITY_DATASET as string) || 'production'
export const apiVersion = (import.meta.env.VITE_SANITY_API_VERSION as string) || '2026-05-15'
export const studioUrl = import.meta.env.VITE_SANITY_STUDIO_URL as string | undefined
export const isSanityConfigured = Boolean(projectId && dataset)
