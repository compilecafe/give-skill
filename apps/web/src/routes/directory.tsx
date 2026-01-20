import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { PlusIcon, SearchIcon, GitPullRequestIcon } from 'lucide-react'
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
          'flins · Universal skill and command manager for AI coding agents',
      },
      {
        name: 'description',
        content:
          'flins · Universal skill and command manager for AI coding agents. Directory of curated skills for Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11+ more AI development tools. Install, manage, and update skills from one unified CLI.',
      },
      // Open Graph
      {
        property: 'og:title',
        content:
          'flins · Universal skill and command manager for AI coding agents',
      },
      {
        property: 'og:description',
        content:
          'Universal skill and command manager for AI coding agents. Directory of curated skills for Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11+ more AI development tools. Install, manage, and update skills from one unified CLI.',
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
          'flins · Universal skill and command manager for AI coding agents',
      },
      {
        name: 'twitter:description',
        content:
          'Universal skill and command manager for AI coding agents. Directory of curated skills for Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11+ more AI development tools. Install, manage, and update skills from one unified CLI.',
      },
      { name: 'twitter:image', content: 'https://flins.tech/og.png' },
      // Additional SEO
      {
        name: 'keywords',
        content:
          'AI coding agents, universal skill manager, command manager, curated skills directory, Claude Code skills, Cursor skills, Copilot skills, GitHub Copilot extensions, AI developer tools, code assistant, AI skills marketplace, Windsurf skills, Gemini CLI skills, agent commands, CLI tools, AI coding assistant, developer productivity, skills repository, command palette, AI extensions',
      },
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
            'flins · Universal skill and command manager for AI coding agents. Directory of curated skills for Claude Code, Cursor, GitHub Copilot, Windsurf, Gemini CLI, and 11+ more AI development tools. Install, manage, and update skills from one unified CLI interface.',
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
            'AI',
            'coding agents',
            'skills',
            'commands',
            'Claude Code',
            'Cursor',
            'Copilot',
            'developer tools',
            'CLI',
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

  const updateSearch = (params: Partial<typeof searchParams>) => {
    navigate({
      search: (prev) => ({ ...prev, ...params }),
      resetScroll: false,
    })
  }

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
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
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

            <InputGroup>
              <InputGroupInput
                aria-label="Search skills"
                placeholder="Search skills..."
                type="search"
                value={searchParams.search ?? ''}
                onInput={(e) =>
                  updateSearch({ search: e.currentTarget.value || undefined })
                }
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

      <div className="border-y">
        <div className="max-w-7xl mx-auto border-x flex flex-col relative h-20">
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-x p-8 text-center">
        <h2 className="text-4xl mb-4">Have a skill to share?</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-6">
          Contribute to the directory and help the community build better AI
          agents
        </p>
        <Button
          variant="default"
          render={
            <a
              href="https://github.com/flinstech/flins/blob/main/CONTRIBUTING_SKILLS.md"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <GitPullRequestIcon />
          Submit your skill
        </Button>
      </div>
    </>
  )
}
