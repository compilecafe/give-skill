import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowUpRightIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { useDebouncer } from '@tanstack/react-pacer'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import { CodeBlockCommand } from '@/components/code-block-command'
import directory from '../directory.json'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/curated/')({
  component: App,
  validateSearch: zodValidator(
    z.object({
      search: z.string().optional(),
      tags: z.string().array().optional(),
    }),
  ),
  loaderDeps: ({ search: { search, tags } }) => ({
    search,
    tags,
  }),
  loader: async ({ deps: { search, tags } }) => {
    let repos = [...directory]

    if (search) {
      const query = search.toLowerCase()
      repos = repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.description.toLowerCase().includes(query) ||
          repo.author.toLowerCase().includes(query),
      )
    }

    if (tags && tags.length > 0) {
      repos = repos.filter((repo) =>
        tags.some((tag) => repo.tags.includes(tag)),
      )
    }

    const allTags = [...new Set(directory.flatMap((repo) => repo.tags))]

    return {
      repos,
      allTags,
      searchParams: { search, tags },
    }
  },
  head: () => ({
    meta: [
      {
        title:
          'Curated: Repositories of AI agent skills from trusted sources',
      },
      {
        name: 'description',
        content:
          'Official AI agent skills from Expo, Vercel, Svelte, Cloudflare, and more. Curated repos for Claude Code, Cursor, Copilot, and 10+ other AI dev tools.',
      },
      // Open Graph
      {
        property: 'og:title',
        content:
          'Curated: Repositories of AI agent skills from trusted sources',
      },
      {
        property: 'og:description',
        content:
          'Official AI agent skills from Expo, Vercel, Svelte, Cloudflare, and more. Curated repos for Claude Code, Cursor, Copilot, and 10+ other AI dev tools.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://flins.tech/curated' },
      { property: 'og:image', content: 'https://flins.tech/og.png' },
      { property: 'og:site_name', content: 'flins' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content:
          'Curated: Repositories of AI agent skills from trusted sources',
      },
      {
        name: 'twitter:description',
        content:
          'Official AI agent skills from Expo, Vercel, Svelte, Cloudflare, and more. Curated repos for Claude Code, Cursor, Copilot, and 10+ other AI dev tools.',
      },
      { name: 'twitter:image', content: 'https://flins.tech/og.png' },
      { name: 'author', content: 'flinstech' },
      { name: 'robots', content: 'index, follow' },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://flins.tech/curated',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Curated AI Agent Skill Repositories',
          description:
            'Official AI agent skills from Expo, Vercel, Svelte, Cloudflare, and more. Curated repos for Claude Code, Cursor, Copilot, and 10+ other AI dev tools.',
          url: 'https://flins.tech/curated',
          author: {
            '@type': 'Organization',
            name: 'flins',
            url: 'https://github.com/flinstech',
          },
        }),
      },
    ],
  }),
})

function App() {
  const { repos, allTags, searchParams } = Route.useLoaderData()
  const navigate = useNavigate({ from: Route.fullPath })
  const [searchInput, setSearchInput] = useState(searchParams.search ?? '')

  const updateSearch = (params: Partial<typeof searchParams>) => {
    navigate({
      search: (prev) => ({ ...prev, ...params }),
      resetScroll: false,
    })
  }

  const debouncedSearch = useDebouncer(
    (search: string | undefined) => updateSearch({ search }),
    { wait: 300 }
  )

  const clearFilters = () => {
    setSearchInput('')
    updateSearch({ search: undefined, tags: undefined })
  }

  const toggleTag = (tag: string) => {
    const currentTags = searchParams.tags ?? []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    updateSearch({ tags: newTags.length > 0 ? newTags : undefined })
  }

  return (
    <>
      <main className='w-full'>
        <div className="max-w-7xl min-h-80 justify-center h-full mx-auto border-x border-b flex flex-col relative">
          <PlusIcon
            aria-hidden="true"
            className="absolute text-neutral-300 z-10 top-0 left-0 -translate-x-1/2 -translate-y-1/2"
          />
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

          <div className="p-8">
            <h1 className="text-4xl">
              Curated
            </h1>
            <p className="text-zinc-400 max-w-2xl mt-1 mb-4">
              Curated repos from trusted sources
            </p>

            <InputGroup className="h-12 px-2 gap-2">
              <InputGroupInput
                aria-label="Search curated repos"
                placeholder="Search repos..."
                type="search"
                value={searchInput}
                onInput={(e) => {
                  const value = e.currentTarget.value
                  setSearchInput(value)
                  debouncedSearch.maybeExecute(value || undefined)
                }}
              />
              <InputGroupAddon>
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
            </InputGroup>

            <div className="flex flex-wrap gap-2 mt-4">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={searchParams.tags?.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="px-8 pb-4">
            <p className="text-sm text-muted-foreground">
              Looking for community skills?{' '}
              <Link to="/discovery" className="text-cyan-400 hover:underline">
                Browse all skills in discovery
              </Link>
            </p>
          </div>

          {repos.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y border-y">
              {repos.map((repo) => (
                <div key={repo.name} className="p-8">
                  <div className="flex items-center gap-2 mb-2">
                    {repo.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-2 justify-between items-center">
                    <h3 className="text-xl font-medium">
                      <a
                        className="flex items-center gap-1 group"
                        href={repo.source}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {repo.name}
                        <ArrowUpRightIcon className="opacity-0 size-4 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
                      </a>
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      by {repo.author}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                    {repo.description}
                  </p>
                  <CodeBlockCommand skill={repo.name} />
                </div>
              ))}
            </section>
          ) : (
            <div className="p-8">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchIcon />
                  </EmptyMedia>
                  <EmptyTitle>No repos found</EmptyTitle>
                  <EmptyDescription>
                    Try a different search term or filter
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={clearFilters}>Clear filters</Button>
                </EmptyContent>
              </Empty>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
