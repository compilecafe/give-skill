import { PlusIcon } from 'lucide-react'

const SectionDivider = () => {
  return (
    <div className="border-y sm:overflow-visible overflow-hidden">
      <div className="max-w-7xl mx-auto border-x flex flex-col relative h-20">
        <PlusIcon aria-hidden="true" className="absolute text-neutral-300 z-10 top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
        <PlusIcon aria-hidden="true" className="absolute text-neutral-300 z-10 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
        <PlusIcon aria-hidden="true" className="absolute text-neutral-300 z-10 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <PlusIcon aria-hidden="true" className="absolute text-neutral-300 z-10 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  )
}

export default SectionDivider
