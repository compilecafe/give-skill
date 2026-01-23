import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowUpRightIcon,
  DownloadIcon,
  PlusIcon,
  SearchIcon,
  SparkleIcon,
} from 'lucide-react'
import { useDebouncer } from '@tanstack/react-pacer'
import { useState } from 'react'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
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
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/discovery/')({
  component: App,
  validateSearch: zodValidator(
    z.object({
      search: z.string().optional(),
      featured: z.boolean().optional(),
    }),
  ),
  loaderDeps: ({ search: { search, featured } }) => ({
    search,
    featured,
  }),
  loader: async ({ deps: { search, featured }, context }) => {
    let allSkills = await context.queryClient.ensureQueryData(
      convexQuery(api.stats.getAllSkills, {}),
    )

    if (search) {
      const query = search.toLowerCase()
      allSkills = allSkills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          (skill.repo?.toLowerCase().includes(query) ?? false),
      )
    }

    if (featured) {
      allSkills = allSkills.filter((skill) => skill.isFeatured)
    }

    return {
      allSkills,
      searchParams: { search, featured },
    }
  },
  head: () => ({
    meta: [
      {
        title:
          'Discovery: Find AI agent skills for Claude, Cursor, Copilot, and more',
      },
      {
        name: 'description',
        content:
          'Discover and install AI agent skills. Works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 10+ other AI dev tools.',
      },
      // Open Graph
      {
        property: 'og:title',
        content:
          'Discovery: Find AI agent skills for Claude, Cursor, Copilot, and more',
      },
      {
        property: 'og:description',
        content:
          'Discover and install AI agent skills. Works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 10+ other AI dev tools.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://flins.tech/discovery' },
      { property: 'og:image', content: 'https://flins.tech/og.png' },
      { property: 'og:site_name', content: 'flins' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content:
          'Discovery: Find AI agent skills for Claude, Cursor, Copilot, and more',
      },
      {
        name: 'twitter:description',
        content:
          'Discover and install AI agent skills. Works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 10+ other AI dev tools.',
      },
      { name: 'twitter:image', content: 'https://flins.tech/og.png' },
      { name: 'author', content: 'flinstech' },
      { name: 'robots', content: 'index, follow' },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://flins.tech/discovery',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'flins',
          description:
            'Discover and install AI agent skills. Works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 10+ other AI dev tools.',
          url: 'https://flins.tech/discovery',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'macOS, Linux, Windows',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          author: {
            '@type': 'Organization',
            name: 'flins',
            url: 'https://github.com/flinstech',
          },
          keywords: [
            'skills discovery',
            'agent skills',
            'Claude Code skills',
            'Cursor skills',
            'Copilot skills',
            'AI coding agents',
            'Windsurf skills',
            'Gemini CLI skills',
            'AI developer tools',
            'skills manager',
            'CLI',
            'flins',
          ],
        }),
      },
    ],
  }),
})

function App() {
  const { allSkills, searchParams } = Route.useLoaderData()
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
    { wait: 300 },
  )

  const clearFilters = () => {
    setSearchInput('')
    updateSearch({ search: undefined, featured: undefined })
  }

  const toggleFeatured = () => {
    updateSearch({ featured: searchParams.featured ? undefined : true })
  }

  return (
    <>
      <main className="w-full">
        <div className="max-w-7xl min-h-80 justify-center h-full mx-auto border-x border-b flex flex-col relative">
          <PlusIcon
            aria-hidden="true"
            className="absolute text-neutral-300 z-10 top-0 left-0 -translate-x-1/2 -translate-y-1/2"
          />
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

          <div className="p-8">
            <h1 className="text-4xl">Discovery</h1>
            <p className="text-zinc-400 max-w-2xl mt-1 mb-4">
              Find and install skills for your AI dev workflow
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <InputGroup className="h-10 px-2 gap-2 flex-1">
                <InputGroupInput
                  aria-label="Search skills"
                  placeholder="Search skills..."
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

              <Button
                variant={searchParams.featured ? 'default' : 'outline'}
                size="xl"
                onClick={toggleFeatured}
              >
                <SparkleIcon className="size-4" />
                Curated only
              </Button>
            </div>
          </div>

          <div className="px-8 pb-8 space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't see your skill? Run command below and it'll automatically
              show up here.
            </p>
            <CodeBlockCommand skill="<user>/<repo>" />
            <p className="text-sm text-muted-foreground">
              Looking for curated skills from trusted teams?{' '}
              <Link to="/curated" className="text-cyan-400 hover:underline">
                Browse curated repos
              </Link>
            </p>
          </div>

          {allSkills.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y border-y">
              {allSkills.map((skill) => (
                <div key={skill.name} className="p-8">
                  <div className="flex items-center gap-1">
                    {skill.isFeatured && (
                      <Badge variant="outline">
                        <SparkleIcon />
                        curated
                      </Badge>
                    )}
                    <Badge variant="outline">{skill.type}</Badge>
                  </div>
                  <div className="flex gap-2 mt-1 mb-4 justify-between items-center">
                    <h3 className="text-lg">
                      {skill.sourceUrl ? (
                        <a
                          className="flex items-center gap-1 group"
                          href={skill.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {skill.name}
                          <ArrowUpRightIcon className="opacity-0 size-4 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
                        </a>
                      ) : (
                        skill.name
                      )}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <DownloadIcon className="size-3" />
                      {skill.downloads.toLocaleString()}
                    </div>
                  </div>
                  {skill.repo && (
                    <CodeBlockCommand
                      skill={`${skill.isFeatured && skill.featuredName ? skill.featuredName : skill.repo} --skill ${skill.name}`}
                    />
                  )}
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
                  <EmptyTitle>No skills found</EmptyTitle>
                  <EmptyDescription>
                    Try a different search term
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
