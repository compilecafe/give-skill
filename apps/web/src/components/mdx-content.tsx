import { useMDXComponent } from "@content-collections/mdx/react"

interface MdxContentProps {
  code: string
}

export function MdxContent({ code }: MdxContentProps) {
  const Component = useMDXComponent(code)
  return (
    <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-normal prose-a:text-cyan-400 prose-code:text-cyan-400 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none">
      <Component />
    </div>
  )
}
