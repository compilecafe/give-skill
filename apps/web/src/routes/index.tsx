import { createFileRoute, Link } from '@tanstack/react-router'
import { GrainGradient } from '@paper-design/shaders-react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FlinsCommands } from '@/components/flins-command'
import directory from '../directory.json'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'
import { SUPPORTED_AGENTS } from '@/config/agents'

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
  return (
    <>
      <main>
        <div className="max-w-7xl mx-auto border-x border-b flex flex-col relative">
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

          <GrainGradient
            className="aspect-video"
            colors={['#01413f', '#4ab0b0', '#c6d5d7']}
            colorBack="#000a0f"
            softness={0.7}
            intensity={0.25}
            noise={0.5}
            shape="wave"
            speed={0.5}
            scale={0.32}
            rotation={345}
            offsetX={0.25}
            offsetY={0.15}
          />

          <div className="absolute py-16 inset-8 flex flex-col overflow-hidden items-start">
            <div className="flex flex-col items-start gap-12 mb-20">
              <div className="flex flex-col text-xs font-mono">
                <span className="flex gap-2">
                  <span className="text-cyan-500">pow</span> at
                  <span className="text-cyan-500">Pow-MacBook-Pro</span>
                  in
                  <span className="text-emerald-500">~</span>
                </span>
                <span className="flex items-center">
                  » flins add skill
                  <div className="w-1 h-3 animate-pulse bg-white"></div>
                </span>
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl text-zinc-300 max-w-3xl">
                  One CLI. Every AI agent.
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl">
                  The universal skill manager for Claude Code, Cursor, Windsurf,
                  Copilot, and 10+ more AI development tools.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 max-w-xl">
                {SUPPORTED_AGENTS.map((agent) => (
                  <img
                    key={agent.name}
                    className="h-10 grayscale pointer-events-none select-none opacity-50"
                    src={agent.logo}
                    alt={`${agent.name} Logo`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="border-y">
        <div className="max-w-7xl mx-auto border-x flex flex-col relative h-20">
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
        </div>
      </div>

      <div>
        <div className="max-w-7xl mx-auto border-x flex flex-col relative">
          <PlusIcon className="absolute text-neutral-300 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
          <div className="grid grid-cols-2 items-center">
            <div className="flex flex-col items-start gap-4 p-8">
              <h2 className="text-4xl">Familiar CLI, right out of the box</h2>
              <p className="max-w-lg text-muted-foreground">
                Treat skills like dependencies. Add, update, and remove them
                using the same commands you already know from your favorite
                package managers.
              </p>
              <Button
                render={
                  <a
                    href="https://github.com/flinstech/flins?tab=readme-ov-file#flins"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                Read Docs
              </Button>
            </div>
            <div className="p-10 relative bg-linear-to-bl from-cyan-600 via-transparent to-cyan-600">
              <div className="bg-background p-8 space-y-2">
                <FlinsCommands />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-y">
        <div className="max-w-7xl mx-auto border-x flex flex-col relative h-20">
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 z-10 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
        </div>
      </div>

      <div>
        <div className="max-w-7xl mx-auto border-x flex flex-col relative">
          <PlusIcon className="absolute text-neutral-300 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-neutral-300 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

          <div className="grid grid-cols-2 items-center">
            <div className="p-10 relative bg-linear-to-bl from-cyan-600 via-transparent to-cyan-600">
              <div className="bg-background p-8 space-y-2">
                <div className="flex flex-col -space-y-px">
                  <div className="border flex gap-4 border-zinc-600 border-dashed p-4">
                    <img
                      className="h-10"
                      src="/brands/cloudflare.svg"
                      alt="Cloudflare logo"
                    />
                    <div className="flex flex-col gap-1">
                      <span>cloudflare</span>
                      <span className="text-xs line-clamp-2">
                        Comprehensive Cloudflare platform reference docs for
                        AI/LLM consumption. Covers Workers, Pages, storage (KV,
                        D1, R2), AI (Workers AI, Vectorize, Agents SDK),
                        networking, security, and infrastructure-as-code
                      </span>
                    </div>
                  </div>
                  <div className="border flex gap-4 border-zinc-600 border-dashed p-4">
                    <img
                      className="h-10"
                      src="/brands/expo.svg"
                      alt="Expo logo"
                    />
                    <div className="flex flex-col gap-1">
                      <span>expo</span>
                      <span className="text-xs line-clamp-2">
                        Official AI agent skills from the Expo team for
                        building, deploying, and debugging robust Expo apps
                      </span>
                    </div>
                  </div>
                  <div className="border flex gap-4 border-zinc-600 border-dashed p-4">
                    <img
                      className="h-10"
                      src="/brands/convex.svg"
                      alt="Convex logo"
                    />
                    <div className="flex flex-col gap-1">
                      <span>convex</span>
                      <span className="text-xs line-clamp-2">
                        AI agent skills and templates for building production
                        ready apps with Convex. Patterns for queries, mutations,
                        cron jobs, webhooks, migrations, and more
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 p-8">
              <h2 className="text-4xl">Official skills from teams you trust</h2>
              <p className="max-w-lg text-muted-foreground">
                Browse our curated directory of official skills from leading
                companies and trusted developers in the ecosystem.
              </p>
              <div className="flex items-center gap-2">
                <Button render={<Link to="/directory" />}>Browse Directory</Button>
                <Button
                  variant="outline"
                  render={
                    <a
                      href="https://github.com/flinstech/flins/blob/main/CONTRIBUTING_SKILLS.md"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Submit Yours
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
