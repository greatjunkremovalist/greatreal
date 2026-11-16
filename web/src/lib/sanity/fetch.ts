import {client} from './client'
import {isSanityConfigured} from './env'

export async function fetchSanity<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!isSanityConfigured) return null
  try {
    return await client.fetch<T>(query, params)
  } catch {
    return null
  }
}
