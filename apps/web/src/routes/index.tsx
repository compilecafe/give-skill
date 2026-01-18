import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { PlusIcon, SearchIcon } from 'lucide-react'
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
import { Field, FieldLabel } from '@/components/ui/field'
import { CodeBlockCommand } from '@/components/code-block-command'
import directory from '../directory.json'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

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
  loader: ({ deps: { search, tags, authors } }) => {
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
})

function App() {
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

  return (
    <>
      <header className="border-b">
        <div className="max-w-4xl border-x px-8 mx-auto h-14 flex items-center justify-between">
          <Link to="/">sena</Link>
          <a
            href="https://github.com/compilecafe/sena"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiGithub />
          </a>
        </div>
      </header>

      <main>
        <div className="max-w-4xl mx-auto px-8 py-8 border-x flex flex-col relative">
          <PlusIcon className="absolute text-muted-foreground top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-muted-foreground top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <PlusIcon className="absolute text-muted-foreground bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <PlusIcon className="absolute text-muted-foreground bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Supercharge your coding AI</h1>
            <p>Discover skills from any git repository for universal coding AI agents</p>
          </div>

          <InputGroup className="mt-6 mb-8">
            <InputGroupInput
              aria-label="Search"
              placeholder="Search"
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="max-w-4xl border-x px-8 mx-auto py-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Link to="/">sena</Link>
            <p className="text-muted-foreground text-sm">
              Open-source universal coding AI agent skill enabler
            </p>
          </div>
          <a
            href="https://github.com/compilecafe/sena"
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
