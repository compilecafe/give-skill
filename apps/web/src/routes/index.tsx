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
          'flins: The universal skill manager for AI coding agents',
      },
      {
        name: 'description',
        content:
          'Install and manage AI agent skills from one CLI. Works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 10+ other AI dev tools.',
      },
      // Open Graph
      {
        property: 'og:title',
        content:
          'flins: The universal skill manager for AI coding agents',
      },
      {
        property: 'og:description',
        content:
          'Install and manage AI agent skills from one CLI. Works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 10+ other AI dev tools.',
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
          'flins: The universal skill manager for AI coding agents',
      },
      {
        name: 'twitter:description',
        content:
          'Install and manage AI agent skills from one CLI. Works with Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 10+ other AI dev tools.',
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
            'The universal skill manager for AI coding agents. Install and manage skills for Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and 10+ other AI dev tools from one CLI.',
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
            'well-known skills',
            'agent skills discovery',
            'Cloudflare RFC',
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
        <div className="max-w-7xl md:min-h-160 min-h-svh h-full py-16 px-8 mx-auto border-x items-start border-b flex flex-col relative bg-[url('/hero.webp')] bg-cover bg-no-repeat">
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
                Copilot, and 10+ other AI dev tools.
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
              <h2 className="text-5xl">Works like your package manager</h2>
              <p className="text-muted-foreground text-lg text-balance leading-relaxed">
                Treat skills like dependencies. Add, update, and remove them
                with the same commands you already know.
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
            <div className="sm:p-10 p-4 relative bg-linear-to-bl from-cyan-600 via-transparent to-cyan-600">
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
            <div className="sm:p-10 p-4 lg:order-1 order-2 relative bg-linear-to-bl from-cyan-600 via-transparent to-cyan-600">
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
                A curated directory of official skills from leading companies
                and trusted developers.
              </p>
              <div className="flex items-center gap-2">
                <Button size="xl" render={<Link to="/curated" />}>
                  Browse Curated
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
                git-hosted URL. Install from anywhere, just like your favorite
                package manager.
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
            <div className="sm:p-10 p-4 relative bg-linear-to-bl from-cyan-600 via-transparent to-cyan-600">
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
          <div className="grid lg:grid-cols-2 grid-cols-1 items-center">
            <div className="sm:p-10 p-4 lg:order-1 order-2 relative bg-linear-to-bl from-cyan-600 via-transparent to-cyan-600">
              <div className="bg-background p-8">
                <pre className="text-sm font-mono leading-relaxed">
                  <code>
                    <span className="text-emerald-400">.agents</span>
                    <span className="text-zinc-400">/</span>
                    {`
`}
                    <span className="text-zinc-400">└─ </span>
                    <span className="text-emerald-400">skills</span>
                    <span className="text-zinc-400">/</span>
                    {`
`}
                    <span className="text-zinc-400"> └─ </span>
                    <span className="text-emerald-400">better-auth</span>
                    <span className="text-zinc-400">/</span>
                    <span className="text-cyan-400"> # Source</span>
                    {`

`}
                    <span className="text-zinc-500">
                      # Symlinks point here:
                    </span>
                    {`

`}
                    <span className="text-emerald-400">.claude</span>
                    <span className="text-zinc-400">/</span>
                    {`
`}
                    <span className="text-zinc-400">└─ </span>
                    <span className="text-emerald-400">skills</span>
                    <span className="text-zinc-400">/</span>
                    {`
`}
                    <span className="text-zinc-400"> └─ </span>
                    <span className="text-emerald-400">better-auth</span>
                    <span className="text-cyan-400"> # symlink</span>
                    {`
`}
                    <span className="text-emerald-400">.cursor</span>
                    <span className="text-zinc-400">/</span>
                    {`
`}
                    <span className="text-zinc-400">└─ </span>
                    <span className="text-emerald-400">skills</span>
                    <span className="text-zinc-400">/</span>
                    {`
`}
                    <span className="text-zinc-400"> └─ </span>
                    <span className="text-emerald-400">better-auth</span>
                    <span className="text-cyan-400"> # symlink</span>
                    {`
`}
                    <span className="text-emerald-400">.codex</span>
                    <span className="text-zinc-400">/</span>
                    {`
`}
                    <span className="text-zinc-400">└─ </span>
                    <span className="text-emerald-400">skills</span>
                    <span className="text-zinc-400">/</span>
                    {`
`}
                    <span className="text-zinc-400"> └─ </span>
                    <span className="text-emerald-400">better-auth</span>
                    <span className="text-cyan-400"> # symlink</span>
                  </code>
                </pre>
              </div>
            </div>
            <div className="flex lg:order-2 order-1 flex-col items-start gap-6 p-8">
              <h2 className="text-5xl">One folder. Every agent.</h2>
              <p className="text-muted-foreground text-lg text-balance leading-relaxed">
                flins uses symlinks by default. Source files live in{' '}
                <code className="text-cyan-400">.agents/</code> and symlink to
                each agent's directory. Update once, sync everywhere.
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">+</span> Single source of
                  truth
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">+</span> No duplicate files
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">+</span> Easier maintenance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section>
        <div className="max-w-7xl mx-auto border-x flex flex-col relative">
          <div className="grid lg:grid-cols-2 grid-cols-1 items-center">
            <div className="flex flex-col items-start gap-6 p-8">
              <h2 className="text-5xl">
                Install from .well-known/skills
              </h2>
              <p className="text-muted-foreground text-lg text-balance leading-relaxed">
                flins supports Cloudflare's Agent Skills Discovery RFC. Install
                skills directly from any domain hosting a{' '}
                <code className="text-cyan-400">
                  .well-known/skills/index.json
                </code>{' '}
                endpoint.
              </p>
              <Button
                size="xl"
                render={
                  <a
                    href="https://github.com/cloudflare/agent-skills-discovery-rfc"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                View RFC Spec
              </Button>
            </div>
            <div className="sm:p-10 p-4 relative bg-linear-to-bl from-orange-600 via-transparent to-orange-600">
              <div className="bg-background p-8 space-y-4 overflow-x-auto">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-mono">
                    # Install from Cloudflare docs
                  </span>
                  <pre className="text-sm font-mono">
                    <code>
                      <span className="text-zinc-400">$ </span>
                      <span className="text-cyan-400">flins add</span>{' '}
                      <span className="text-orange-400">
                        developer.cloudflare.com
                      </span>
                    </code>
                  </pre>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-mono">
                    # List available skills
                  </span>
                  <pre className="text-sm font-mono">
                    <code>
                      <span className="text-zinc-400">$ </span>
                      <span className="text-cyan-400">flins add</span>{' '}
                      <span className="text-orange-400">
                        developer.cloudflare.com
                      </span>{' '}
                      <span className="text-zinc-400">--list</span>
                    </code>
                  </pre>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-mono">
                    # Install specific skill
                  </span>
                  <pre className="text-sm font-mono">
                    <code>
                      <span className="text-zinc-400">$ </span>
                      <span className="text-cyan-400">flins add</span>{' '}
                      <span className="text-orange-400">
                        developer.cloudflare.com
                      </span>{' '}
                      <span className="text-zinc-400">--skill</span>{' '}
                      <span className="text-yellow-400">cloudflare</span>
                    </code>
                  </pre>
                </div>
                <div className="border-t border-zinc-700 pt-4 mt-4">
                  <span className="text-xs text-zinc-500 font-mono block mb-2">
                    # Works with any RFC-compatible domain
                  </span>
                  <code className="text-xs text-zinc-400">
                    flins add {'<domain>'} → fetches /.well-known/skills/
                  </code>
                </div>
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
                Install flins and add your first skill in seconds
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
                render={<Link to="/discovery" />}
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
