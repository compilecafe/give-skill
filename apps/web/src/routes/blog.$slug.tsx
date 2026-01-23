import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { allPosts } from 'content-collections'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ListIcon,
  UserIcon,
} from 'lucide-react'
import { MdxContent } from '@/components/mdx-content'
import { GiscusComments } from '@/components/giscus-comments'
import SectionDivider from '@/components/section-divider'

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPost,
  loader: ({ params }) => {
    const post = allPosts.find((p) => p._meta.path === params.slug)
    if (!post) {
      throw notFound()
    }

    const otherPosts = allPosts
      .filter((p) => p._meta.path !== params.slug)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)

    return { post, recommendedPosts: otherPosts }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: 'Post Not Found | flins' }],
      }
    }
    const { post } = loaderData
    return {
      meta: [
        { title: `${post.title} | flins` },
        { name: 'description', content: post.summary },
        { property: 'og:title', content: `${post.title} | flins` },
        { property: 'og:description', content: post.summary },
        { property: 'og:type', content: 'article' },
        {
          property: 'og:url',
          content: `https://flins.tech/blog/${post._meta.path}`,
        },
        { property: 'og:image', content: 'https://flins.tech/og.png' },
        { property: 'og:site_name', content: 'flins' },
        {
          property: 'article:published_time',
          content: post.date.toISOString(),
        },
        { property: 'article:author', content: post.author },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${post.title} | flins` },
        { name: 'twitter:description', content: post.summary },
        { name: 'twitter:image', content: 'https://flins.tech/og.png' },
        { name: 'author', content: post.author },
        { name: 'robots', content: 'index, follow' },
      ],
      links: [
        {
          rel: 'canonical',
          href: `https://flins.tech/blog/${post._meta.path}`,
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.summary,
            datePublished: post.date.toISOString(),
            author: {
              '@type': 'Person',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'flins',
              url: 'https://flins.tech',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://flins.tech/blog/${post._meta.path}`,
            },
          }),
        },
      ],
    }
  },
})

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function TableOfContents({
  headings,
}: {
  headings: { level: number; text: string; slug: string }[]
}) {
  if (headings.length === 0) return null

  return (
    <nav className="p-6 border border-border bg-muted/30">
      <h2 className="text-sm font-medium mb-4 flex items-center gap-2">
        <ListIcon className="size-4" />
        Table of Contents
      </h2>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.slug}
            style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
          >
            <a
              href={`#${heading.slug}`}
              className="text-muted-foreground hover:text-cyan-400 transition-colors block py-1"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function RecommendedPosts({
  posts,
}: {
  posts: (typeof allPosts)[number][]
}) {
  if (posts.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto border-x border-b">
      <div className="p-8">
        <h2 className="text-2xl mb-2">Keep reading</h2>
        <p className="text-zinc-400">More from the blog</p>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y border-y">
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
              <h3 className="text-xl mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
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
    </div>
  )
}

function BlogPost() {
  const { post, recommendedPosts } = Route.useLoaderData()

  return (
    <main className="w-full">
      <div className="max-w-7xl mx-auto border-x border-b">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <Link
            to="/blog"
            className="text-sm text-muted-foreground hover:text-cyan-400 flex items-center gap-1.5 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to blog
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="size-3.5" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <UserIcon className="size-3.5" />
                {post.author}
              </span>
            </div>
            <p className="text-lg text-zinc-400 mt-6 leading-relaxed">
              {post.summary}
            </p>
          </header>

          {post.headings.length > 0 && (
            <div className="mb-12">
              <TableOfContents headings={post.headings} />
            </div>
          )}

          <article>
            <MdxContent code={post.mdx} />
          </article>
        </div>
      </div>

      <SectionDivider />

      <div className="max-w-7xl mx-auto border-x border-b">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <h2 className="text-2xl mb-8">Comments</h2>
          <GiscusComments slug={post._meta.path} />
        </div>
      </div>

      <SectionDivider />

      <RecommendedPosts posts={recommendedPosts} />
    </main>
  )
}
