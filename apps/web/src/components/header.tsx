import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons'
import { Link } from '@tanstack/react-router'
import SectionDivider from './section-divider'
import { Button } from './ui/button'
import logo from '../logo.svg'
import { ArrowUpRightIcon, MenuIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="border-b relative z-10">
        <div className="max-w-7xl border-x px-8 mx-auto h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl">
            <img className="size-6" src={logo} alt="flins logo" />
            flins
          </Link>
          <nav aria-label="Main navigation" className="flex items-center">
            <div className={cn("sm:items-center sm:static border-b sm:border-b-0 inset-x-0 absolute top-full sm:flex-row flex-col bg-background divide-y sm:divide-y-0", isOpen ? "flex" : "hidden sm:flex")}>
              <Button variant="ghost" render={<Link to="/discovery" />}>
                Discovery
              </Button>
              <Button variant="ghost" render={<Link to="/curated" />}>
                Curated
              </Button>
              <Button variant="ghost" render={<Link to="/blog" />}>
                Blog
              </Button>
              <Button
                variant="ghost"
                render={
                  <a
                    href="https://github.com/flinstech/flins?tab=readme-ov-file#flins"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                Docs
                <ArrowUpRightIcon aria-hidden="true" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon-xl"
              aria-label="Join Discord community (opens in new tab)"
              render={
                <a
                  href="https://discord.gg/a8dEPa7eNs"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <SiDiscord />
            </Button>
            <Button
              variant="ghost"
              size="icon-xl"
              aria-label="View source on GitHub (opens in new tab)"
              render={
                <a
                  href="https://github.com/flinstech/flins"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <SiGithub />
            </Button>
            <Button
              onClick={() => setIsOpen((isOpen) => !isOpen)}
              variant="ghost"
              size="icon-xl"
              className='sm:hidden'
              aria-label="Open menu"
            >
              <MenuIcon />
            </Button>
          </nav>
        </div>
      </header>

      <SectionDivider />
    </>
  )
}

export default Header
