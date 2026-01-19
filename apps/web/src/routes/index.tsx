import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons'
import {
  CheckIcon,
  CopyIcon,
  PlusIcon,
  SearchIcon,
  GitPullRequestIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue,
} from '@/components/ui/combobox'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { CodeBlockCommand } from '@/components/code-block-command'
import directory from '../directory.json'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip'
import { SUPPORTED_AGENTS } from '@/config/agents'
import logo from '../logo.svg'

export const Route = createFileRoute('/')({
  component: App,
  validateSearch: zodValidator(
    z.object({
      search: z.string().optional(),
      tags: z.string().array().optional(),
      authors: z.string().array().optional(),
    }),
  ),
  loaderDeps: ({ search: { search, tags, authors } }) => ({
    search,
    tags,
    authors,
  }),
  loader: async ({ deps: { search, tags, authors } }) => {
    let skills = directory

    if (search) {
      const query = search.toLowerCase()
      skills = skills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query),
      )
    }

    if (authors && authors.length > 0) {
      skills = skills.filter((skill) => authors.includes(skill.author))
    }

    if (tags && tags.length > 0) {
      skills = skills.filter((skill) =>
        tags.some((tag) => skill.tags.includes(tag)),
      )
    }

    const allAuthors = [...new Set(directory.map((skill) => skill.author))]
    const categories = [...new Set(directory.flatMap((skill) => skill.tags))]

    return {
      skills,
      authors: allAuthors,
      categories,
      searchParams: { search, tags, authors },
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
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const inputRef = useRef<HTMLInputElement>(null)
  const { skills, authors, categories, searchParams } = Route.useLoaderData()
  const navigate = useNavigate({ from: Route.fullPath })

  const authorItems = useMemo(
    () =>
      authors.map((author) => ({
        label: author,
        value: author,
      })),
    [authors],
  )

  const updateSearch = (params: Partial<typeof searchParams>) => {
    navigate({
      search: (prev) => ({ ...prev, ...params }),
    })
  }

  const toggleTag = (tag: string) => {
    const currentTags = searchParams.tags ?? []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    updateSearch({ tags: newTags.length > 0 ? newTags : undefined })
  }

  const toggleAuthor = (author: string) => {
    const currentAuthors = searchParams.authors ?? []
    const newAuthors = currentAuthors.includes(author)
      ? currentAuthors.filter((a) => a !== author)
      : [...currentAuthors, author]
    updateSearch({ authors: newAuthors.length > 0 ? newAuthors : undefined })
  }

  return (
    <>
      <header className="border-b">
        <div className="max-w-7xl border-x px-8 mx-auto h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl">
            <img className="size-6" src={logo} alt="flins logo" />
            flins
          </Link>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon-xl"
              render={
                <a
                  href="https://discord.gg/a8dEPa7eNs"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <SiDiscord />
            </Button>
            <Button
              variant="ghost"
              size="icon-xl"
              render={
                <a
                  href="https://github.com/flinstech/flins"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <SiGithub />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto px-8 py-8 border-x flex flex-col relative">
          <PlusIcon className="absolute text-muted-foreground top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-muted-foreground top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-muted-foreground bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-muted-foreground bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 text-center max-w-xl mx-auto">
              <h1 className="text-4xl font-bold">
                Universal skill and command manager for AI coding agents
              </h1>
              <p>
                Install, manage, and update skills and commands across 16+ AI
                development tools from one unified interface
              </p>
              <Field className="max-w-max mx-auto items-center">
                <InputGroup>
                  <InputGroupInput
                    className="font-mono"
                    aria-label="Global install command"
                    value="npm i -g flins"
                    ref={inputRef}
                    readOnly
                    type="text"
                  />
                  <InputGroupAddon align="inline-end">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            aria-label="Copy"
                            onClick={() => {
                              if (inputRef.current) {
                                copyToClipboard(inputRef.current.value)
                              }
                            }}
                            size="icon-xs"
                            variant="ghost"
                          />
                        }
                      >
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                      </TooltipTrigger>
                      <TooltipPopup>
                        <p>Copy to clipboard</p>
                      </TooltipPopup>
                    </Tooltip>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription className="text-sm">
                  Install flins globally (optional)
                </FieldDescription>
              </Field>
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {SUPPORTED_AGENTS.map((agent) => (
                <Button
                  key={agent.name}
                  size="sm"
                  variant="outline"
                  render={
                    <a
                      href={agent.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  {agent.logo && (
                    <img
                      className="h-4"
                      src={agent.logo}
                      alt={`${agent.name} Logo`}
                    />
                  )}
                  {agent.name}
                </Button>
              ))}
            </div>
          </div>

          <InputGroup className="mt-6 mb-8">
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
              {(searchParams.search ||
                searchParams.tags?.length ||
                searchParams.authors?.length) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateSearch({
                      search: undefined,
                      tags: undefined,
                      authors: undefined,
                    })
                  }
                >
                  Clear all
                </Button>
              )}
            </InputGroupAddon>
          </InputGroup>

          <div className="flex md:flex-row flex-col gap-8">
            <div className="md:w-70 shrink-0">
              <div className="sticky top-4 space-y-6">
                <Field>
                  <FieldLabel>Quick install from curated list:</FieldLabel>
                  <code className="text-xs">flins add expo</code>
                </Field>
                <Field>
                  <FieldLabel>Or from any git repository:</FieldLabel>
                  <div className="flex flex-col gap-1">
                    <code className="text-xs">flins add user/repo</code>
                    <code className="text-xs">
                      flins add gitlab.com/org/skills
                    </code>
                    <code className="text-xs">
                      flins add any-git-host.com/repo
                    </code>
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Available commands:</FieldLabel>
                  <div className="flex flex-wrap items-center gap-1">
                    <code className="text-xs">flins add</code>
                    <code className="text-xs">·</code>
                    <code className="text-xs">flins update</code>
                    <code className="text-xs">·</code>
                    <code className="text-xs">flins remove</code>
                    <code className="text-xs">·</code>
                    <code className="text-xs">flins outdated</code>
                    <code className="text-xs">·</code>
                    <code className="text-xs">flins clean</code>
                    <code className="text-xs">·</code>
                    <code className="text-xs">flins list</code>
                    <code className="text-xs">·</code>
                    <code className="text-xs">flins search</code>
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Author</FieldLabel>
                  <Combobox
                    items={authorItems}
                    multiple
                    value={authorItems.filter((item) =>
                      searchParams.authors?.includes(item.value),
                    )}
                    onValueChange={(values) =>
                      updateSearch({
                        authors:
                          values.length > 0
                            ? values.map((v) => v.value)
                            : undefined,
                      })
                    }
                  >
                    <ComboboxChips>
                      <ComboboxValue>
                        {(value: { value: string; label: string }[]) => (
                          <>
                            {value?.map((item) => (
                              <ComboboxChip
                                aria-label={item.label}
                                key={item.value}
                              >
                                {item.label}
                              </ComboboxChip>
                            ))}
                            <ComboboxInput
                              aria-label="Select authors"
                              placeholder={
                                value.length > 0
                                  ? undefined
                                  : 'Select authors...'
                              }
                            />
                          </>
                        )}
                      </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxPopup>
                      <ComboboxEmpty>No results found.</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item.value} value={item}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxPopup>
                  </Combobox>
                </Field>
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <div className="flex flex-wrap gap-1">
                    {categories.map((category) => {
                      const isSelected = searchParams.tags?.includes(category)
                      return (
                        <Button
                          key={category}
                          size="sm"
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
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold">Curated Skills</h2>
                <Button
                  size="sm"
                  variant="outline"
                  render={
                    <a
                      href="https://github.com/flinstech/flins/blob/main/CONTRIBUTING_SKILLS.md"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <GitPullRequestIcon />
                  Submit yours
                </Button>
              </div>
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex flex-col gap-2 border p-4"
                >
                  <h3 className="flex justify-between items-center">
                    {skill.name}
                    <div className="flex gap-2">
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
                    </div>
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {skill.description}
                  </p>
                  <CodeBlockCommand skill={skill.name} />
                  <div className="flex flex-wrap gap-1">
                    {skill.tags.map((tag) => (
                      <Button
                        key={tag}
                        size="xs"
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
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground text-sm">By</span>
                    <Button
                      size="xs"
                      variant={
                        searchParams.authors?.includes(skill.author)
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => toggleAuthor(skill.author)}
                    >
                      {skill.author}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="max-w-7xl border-x px-8 mx-auto py-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Link to="/">flins</Link>
            <p className="text-muted-foreground text-sm">
              Universal skill and command manager for AI coding agents
            </p>
          </div>
          <a
            href="https://github.com/flinstech/flins"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiGithub />
          </a>
        </div>
      </footer>
    </>
  )
}
