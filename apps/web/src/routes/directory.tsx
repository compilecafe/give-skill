import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useDebouncer } from '@tanstack/react-pacer'
import { useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardPanel,
  CardFooter,
} from '@/components/ui/card'
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
  InputGroupText,
} from '@/components/ui/input-group'
import { Field, FieldLabel } from '@/components/ui/field'
import { CodeBlockCommand } from '@/components/code-block-command'
import directory from '../directory.json'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

export const Route = createFileRoute('/directory')({
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
    let skills = directory

    if (search) {
      const query = search.toLowerCase()
      skills = skills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.author.toLowerCase().includes(query),
      )
    }

    if (tags && tags.length > 0) {
      skills = skills.filter((skill) =>
        tags.some((tag) => skill.tags.includes(tag)),
      )
    }

    const categories = [...new Set(directory.flatMap((skill) => skill.tags))]

    return {
      skills,
      categories,
      searchParams: { search, tags },
    }
  },
  head: () => ({
    meta: [
      {
        title:
          'Skills Directory · Agent Skills for Claude, Cursor, Copilot, and 13 more',
      },
      {
        name: 'description',
        content:
          'Browse the official directory of AI agent skills. Find and install skills for Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11 more AI coding tools via the flins CLI.',
      },
      // Open Graph
      {
        property: 'og:title',
        content:
          'Skills Directory · Agent Skills for Claude, Cursor, Copilot, and 13 more',
      },
      {
        property: 'og:description',
        content:
          'Browse the official directory of AI agent skills. Find and install skills for Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11 more AI coding tools via the flins CLI.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://flins.tech' },
      { property: 'og:image', content: 'https://flins.tech/og.png' },
      { property: 'og:site_name', content: 'flins' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content:
          'Skills Directory · Agent Skills for Claude, Cursor, Copilot, and 13 more',
      },
      {
        name: 'twitter:description',
        content:
          'Browse the official directory of AI agent skills. Find and install skills for Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11 more AI coding tools via the flins CLI.',
      },
      { name: 'twitter:image', content: 'https://flins.tech/og.png' },
      { name: 'author', content: 'flinstech' },
      { name: 'robots', content: 'index, follow' },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://flins.tech',
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
            'Browse the official directory of AI agent skills for flins. Install skills for Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11 more AI coding tools from one unified CLI.',
          url: 'https://flins.tech',
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
            'skills directory',
            'agent skills',
            'Claude Code skills',
            'Cursor skills',
            'Copilot skills',
            'AI coding agents',
            'Windsurf skills',
            'Gemini CLI skills',
            'Trae skills',
            'Factory Droid skills',
            'Letta skills',
            'OpenCode skills',
            'Codex skills',
            'Antigravity skills',
            'Amp skills',
            'Kilo Code skills',
            'Roo Code skills',
            'Goose skills',
            'Qoder skills',
            'AI developer tools',
            'skills manager',
            'CLI',
            'flins',
          ],
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5',
            ratingCount: '1',
          },
        }),
      },
    ],
  }),
})

function App() {
  const { skills, categories, searchParams } = Route.useLoaderData()
  const navigate = useNavigate({ from: Route.fullPath })

  const [searchInput, setSearchInput] = useState(searchParams.search ?? '')

  const updateSearch = (params: Partial<typeof searchParams>) => {
    navigate({
      search: (prev) => ({ ...prev, ...params }),
      resetScroll: false,
    })
  }

  const debouncedSearchUpdate = useDebouncer(
    (search: string | undefined) => updateSearch({ search }),
    { wait: 300 }
  )

  const toggleTag = (tag: string) => {
    const currentTags = searchParams.tags ?? []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    updateSearch({ tags: newTags.length > 0 ? newTags : undefined })
  }

  const hasFilters =
    (searchParams.search?.length ?? 0) > 0 ||
    (searchParams.tags?.length ?? 0) > 0

  const clearFilters = () =>
    updateSearch({
      search: undefined,
      tags: undefined,
    })

  return (
    <>
      <main>
        <div className="max-w-7xl min-h-80 p-8 justify-center h-full mx-auto border-x border-b flex flex-col relative">
          <PlusIcon
            aria-hidden="true"
            className="absolute text-neutral-300 z-10 top-0 left-0 -translate-x-1/2 -translate-y-1/2"
          />
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

          <div className="flex flex-col gap-10 items-start isolate">
            <div className="space-y-4">
              <h1 className="text-6xl text-zinc-300">
                Browse Skills Directory
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl">
                Discover and install curated skills for your AI development
                workflow
              </p>
            </div>

            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    className="lg:absolute lg:top-8 lg:right-8"
                    size="lg"
                    variant="default"
                  >
                    <PlusIcon />
                    Add skill
                  </Button>
                }
              />
              <PopoverPopup className="w-80">
                <div className="p-4 space-y-3">
                  <PopoverTitle>Contribute a skill</PopoverTitle>
                  <PopoverDescription>
                    Share your skill with the community and help developers
                    build better AI agents
                  </PopoverDescription>
                  <div className="flex gap-2 justify-end pt-2">
                    <PopoverClose
                      render={<Button variant="ghost">Close</Button>}
                    />
                    <Button
                      render={
                        <a
                          href="https://github.com/flinstech/flins/blob/main/CONTRIBUTING_SKILLS.md"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <SiGithub />
                      How to contribute
                    </Button>
                  </div>
                </div>
              </PopoverPopup>
            </Popover>

            <InputGroup className="h-14 px-4 text-base gap-2">
              <InputGroupInput
                aria-label="Search skills"
                placeholder="Search skills..."
                type="search"
                value={searchInput}
                onInput={(e) => {
                  const value = e.currentTarget.value
                  setSearchInput(value)
                  debouncedSearchUpdate.maybeExecute(value || undefined)
                }}
              />
              <InputGroupAddon>
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupText className="whitespace-nowrap">
                  {skills.length} Skills
                </InputGroupText>
                {hasFilters && (
                  <Button size="sm" variant="ghost" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </InputGroupAddon>
            </InputGroup>

            <Field>
              <FieldLabel>Filter by Category:</FieldLabel>
              <div className="flex flex-wrap gap-1">
                {categories.map((category) => {
                  const isSelected = searchParams.tags?.includes(category)
                  return (
                    <Button
                      key={category}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => toggleTag(category)}
                    >
                      {category}
                    </Button>
                  )
                })}
              </div>
            </Field>
          </div>
        </div>
      </main>

      <div className="max-w-7xl mx-auto border-x px-8 py-8">
        {skills.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skills.map((skill) => (
              <Card key={skill.name}>
                <CardHeader>
                  <CardTitle>{skill.name}</CardTitle>
                  <CardDescription>By {skill.author}</CardDescription>
                  <CardAction>
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <a
                          href={skill.source}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <SiGithub />
                      Source
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardPanel>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {skill.description}
                  </p>
                </CardPanel>
                <CardFooter className="flex-col gap-2 items-stretch">
                  <CodeBlockCommand skill={skill.name} />
                  <div className="flex flex-wrap gap-1">
                    {skill.tags.map((tag) => (
                      <Button
                        size="xs"
                        key={tag}
                        variant={
                          searchParams.tags?.includes(tag)
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No skills found</EmptyTitle>
              <EmptyDescription>Try adjusting your filters</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </>
  )
}
