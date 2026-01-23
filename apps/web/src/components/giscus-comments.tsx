import Giscus from '@giscus/react'

interface GiscusCommentsProps {
  slug: string
}

export function GiscusComments({ slug }: GiscusCommentsProps) {
  return (
    <Giscus
      id="comments"
      repo="flinstech/flins"
      repoId="R_kgDOOTiHrQ"
      category="Blog Comments"
      categoryId="DIC_kwDOOTiHrc4CmluH"
      mapping="specific"
      term={slug}
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="dark"
      lang="en"
      loading="lazy"
    />
  )
}
