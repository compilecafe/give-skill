import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { FlinsCommands } from '@/components/flins-command'
import { GitSourceExamples } from '@/components/git-source-examples'
import { CodeBlockCommand } from '@/components/code-block-command'
import directory from '../directory.json'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'
import { SUPPORTED_AGENTS } from '@/config/agents'
import SectionDivider from '@/components/section-divider'

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
          'Install and manage AI agent skills from one CLI. flins works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11 more AI coding tools. Browse the official skills directory.',
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
          'Install and manage AI agent skills from one CLI. flins works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11 more AI coding tools. Browse the official skills directory.',
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
          'Install and manage AI agent skills from one CLI. flins works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11 more AI coding tools. Browse the official skills directory.',
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
            'flins · Universal agent skills manager for AI coding tools. Install and manage skills for Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 11 more from one unified CLI. Browse the official skills directory.',
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
            'command palette',
            'AI extensions',
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
  return (
    <>
      <main>
        <div className="max-w-7xl md:min-h-160 min-h-dvh h-full py-16 px-8 mx-auto border-x items-start border-b flex flex-col relative bg-[url('/hero.png')] bg-cover bg-no-repeat">
          <div className="flex flex-col items-start gap-12 isolate">
            <div className="flex flex-col text-xs font-mono">
              <span className="flex gap-2">
                <span className="text-cyan-500">pow</span> at
                <span className="text-cyan-500">Pow-MacBook-Pro</span>
                in
                <span className="text-emerald-500">~</span>
              </span>
              <span className="flex items-center">
                » flins add user/repo
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
      </main>

      <SectionDivider />

      <section>
        <div className="max-w-7xl mx-auto border-x flex flex-col relative">
          <div className="grid lg:grid-cols-2 items-center">
            <div className="flex flex-col items-start gap-6 p-8">
              <h2 className="text-5xl">Familiar CLI, right out of the box</h2>
              <p className="text-muted-foreground text-lg text-balance leading-relaxed">
                Treat skills like dependencies. Add, update, and remove them
                using the same commands you already know from your favorite
                package managers.
              </p>
              <Button
                size="xl"
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
      </section>

      <SectionDivider />

      <section>
        <div className="max-w-7xl mx-auto border-x flex flex-col relative">
          <div className="grid lg:grid-cols-2 grid-cols-1 items-center">
            <div className="p-10 lg:order-1 order-2 relative bg-linear-to-bl from-cyan-600 via-transparent to-cyan-600">
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
            <div className="flex lg:order-2 order-1 flex-col items-start gap-6 p-8">
              <h2 className="text-5xl">Official skills from teams you trust</h2>
              <p className="text-muted-foreground text-lg text-balance leading-relaxed">
                Browse our curated directory of official skills from leading
                companies and trusted developers in the ecosystem.
              </p>
              <div className="flex items-center gap-2">
                <Button size="xl" render={<Link to="/directory" />}>
                  Browse Directory
                </Button>
                <Button
                  size="xl"
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
      </section>

      <SectionDivider />

      <section>
        <div className="max-w-7xl mx-auto border-x flex flex-col relative">
          <div className="grid lg:grid-cols-2 items-center">
            <div className="flex flex-col items-start gap-6 p-8">
              <h2 className="text-5xl">Install from any git repository</h2>
              <p className="text-muted-foreground text-lg text-balance leading-relaxed">
                Pull skills directly from GitHub, GitLab, Codeberg, or any
                git-hosted URL. Just like your favorite package managers, flins
                gives you the flexibility to install from anywhere.
              </p>
              <Button
                size="xl"
                render={
                  <a
                    href="https://github.com/flinstech/flins?tab=readme-ov-file#source-formats"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                View All Formats
              </Button>
            </div>
            <div className="p-10 relative bg-linear-to-bl from-cyan-600 via-transparent to-cyan-600">
              <div className="bg-background p-8 space-y-2">
                <GitSourceExamples />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section>
        <div className="max-w-7xl mx-auto border-x flex flex-col relative">
          <div className="flex flex-col items-center gap-8 p-8 text-center">
            <div className="space-y-4">
              <h2 className="text-4xl">Get started</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Install flins and add your first skill
              </p>
            </div>
            <div className="w-full max-w-md">
              <CodeBlockCommand skill="better-auth" />
            </div>
            <div className="flex gap-4">
              <Button
                size="xl"
                render={
                  <a
                    href="https://github.com/flinstech/flins"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                GitHub
              </Button>
              <Button
                size="xl"
                variant="outline"
                render={<Link to="/directory" />}
              >
                Browse Skills
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
