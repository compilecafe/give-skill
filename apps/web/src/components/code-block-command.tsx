'use client'

import * as React from 'react'
import { CheckIcon, CopyIcon, TerminalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useConfig } from '@/hooks/use-config'

export function CodeBlockCommand({
  skill,
}: React.ComponentProps<'pre'> & {
  skill: string
}) {
  const [config, setConfig] = useConfig()
  const { isCopied, copyToClipboard } = useCopyToClipboard()

  const packageManager = config.packageManager
  const tabs = React.useMemo(() => {
    return {
      bun: `bunx --bun sena@latest ${skill}`,
      npm: `npx sena@latest ${skill}`,
      pnpm: `pnpm dlx sena@latest ${skill}`,
      yarn: `yarn dlx sena@latest ${skill}`,
    }
  }, [])

  const copyCommand = React.useCallback(() => {
    const command = tabs[packageManager]

    if (!command) {
      return
    }

    copyToClipboard(command)
  }, [packageManager, tabs, copyToClipboard])

  return (
    <div className="relative border">
      <Tabs
        className="gap-0"
        onValueChange={(value) => {
          setConfig({
            ...config,
            packageManager: value as 'pnpm' | 'npm' | 'yarn' | 'bun',
          })
        }}
        value={packageManager}
      >
        <div className="flex items-center gap-2 border-border/64 border-b px-4 py-1 font-mono">
          <TerminalIcon className="size-4" />
          <TabsList className="bg-transparent p-0 *:data-[slot=tab-indicator]:rounded-lg *:data-[slot=tab-indicator]:bg-accent *:data-[slot=tab-indicator]:shadow-none">
            {Object.entries(tabs).map(([key]) => {
              return (
                <TabsTab className="rounded-lg" key={key} value={key}>
                  {key}
                </TabsTab>
              )
            })}
          </TabsList>
        </div>
        <ScrollArea className="**:data-[slot=scroll-area-scrollbar]:data-[orientation=horizontal]:mx-2 **:data-[slot=scroll-area-scrollbar]:data-[orientation=vertical]:my-2">
          {Object.entries(tabs).map(([key, value]) => {
            return (
              <TabsPanel
                className="mt-0 w-max px-4 py-3.5"
                key={key}
                value={key}
              >
                <pre>
                  <code
                    className="relative font-mono text-[.8125rem] leading-none"
                    data-language="bash"
                  >
                    {value}
                  </code>
                </pre>
              </TabsPanel>
            )
          })}
        </ScrollArea>
      </Tabs>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              className="absolute top-1.5 right-1.5 z-3 size-9 opacity-70 hover:opacity-100 focus-visible:opacity-100 sm:size-8"
              data-slot="copy-button"
              onClick={copyCommand}
              size="icon"
              variant="ghost"
            >
              <span className="sr-only">Copy</span>
              {isCopied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          }
        />
        <TooltipPopup>{isCopied ? 'Copied' : 'Copy to Clipboard'}</TooltipPopup>
      </Tooltip>
    </div>
  )
}
