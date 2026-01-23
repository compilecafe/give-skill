import { DIRECTORY_URL } from "@/config";

export interface DirectoryEntry {
  name: string;
  source: string;
  description: string;
  author?: string;
  tags?: string[];
}

let directoryCache: DirectoryEntry[] | null = null;
let cacheExpiry: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export async function fetchDirectory(): Promise<DirectoryEntry[]> {
  const now = Date.now();

  if (directoryCache && cacheExpiry && now < cacheExpiry) {
    return directoryCache;
  }

  try {
    const response = await fetch(DIRECTORY_URL, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch directory: ${response.status}`);
    }

    const data = (await response.json()) as DirectoryEntry[];
    directoryCache = data;
    cacheExpiry = now + CACHE_DURATION;
    return data;
  } catch (error) {
    if (directoryCache) {
      return directoryCache;
    }
    throw error;
  }
}

export async function resolveSourceFromDirectory(name: string): Promise<string | null> {
  const directory = await fetchDirectory();

  const entry = directory.find((item) => item.name.toLowerCase() === name.toLowerCase());

  return entry?.source ?? null;
}

export function isDirectoryName(source: string): boolean {
  return /^[a-z0-9-]+$/i.test(source) && !source.includes("/") && !source.includes(":");
}

export async function listDirectory(): Promise<DirectoryEntry[]> {
  return fetchDirectory();
}
