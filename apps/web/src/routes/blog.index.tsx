import { createFileRoute, Link } from '@tanstack/react-router'
import { allPosts } from 'content-collections'
import { PlusIcon, CalendarIcon, UserIcon, ArrowRightIcon } from 'lucide-react'

export const Route = createFileRoute('/blog/')({
  component: BlogIndex,
  loader: () => {
    const posts = allPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return { posts }
  },
  head: () => ({
    meta: [
      {
        title: 'Blog | flins',
      },
      {
        name: 'description',
        content:
          'Updates, guides, and tips for building with AI agents. Learn how to get the most out of Claude Code, Cursor, Copilot, and more.',
      },
      {
        property: 'og:title',
        content: 'Blog | flins',
      },
      {
        property: 'og:description',
        content:
          'Updates, guides, and tips for building with AI agents. Learn how to get the most out of Claude Code, Cursor, Copilot, and more.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://flins.tech/blog' },
      { property: 'og:image', content: 'https://flins.tech/og.png' },
      { property: 'og:site_name', content: 'flins' },
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content: 'Blog | flins',
      },
      {
        name: 'twitter:description',
        content:
          'Updates, guides, and tips for building with AI agents. Learn how to get the most out of Claude Code, Cursor, Copilot, and more.',
      },
      { name: 'twitter:image', content: 'https://flins.tech/og.png' },
      { name: 'author', content: 'flinstech' },
      { name: 'robots', content: 'index, follow' },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://flins.tech/blog',
      },
    ],
  }),
})

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function BlogIndex() {
  const { posts } = Route.useLoaderData()

  return (
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
          <h1 className="text-4xl">Blog</h1>
          <p className="text-zinc-400 max-w-2xl mt-1">
            Updates, guides, and tips for AI agent workflows
          </p>
        </div>

        {posts.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y border-y">
            {posts.map((post) => (
              <article key={post._meta.path} className="p-8 group">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post._meta.path }}
                  className="block"
                >
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="size-3.5" />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="size-3.5" />
                      {post.author}
                    </span>
                  </div>
                  <h2 className="text-xl mb-3 group-hover:text-cyan-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                    {post.summary}
                  </p>
                  <span className="text-sm text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read more
                    <ArrowRightIcon className="size-3.5" />
                  </span>
                </Link>
              </article>
            ))}
          </section>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </main>
  )
}
