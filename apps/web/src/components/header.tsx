import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons'
import { Link } from '@tanstack/react-router'
import SectionDivider from './section-divider'
import { Button } from './ui/button'
import logo from '../logo.svg'
import { ArrowUpRightIcon } from 'lucide-react'

const Header = () => {
  return (
    <>
      <header className="border-b">
        <div className="max-w-7xl border-x px-8 mx-auto h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl">
            <img className="size-6" src={logo} alt="flins logo" />
            flins
          </Link>
          <nav aria-label="Main navigation" className="flex items-center">
            <Button variant="ghost" render={<Link to="/discovery" />}>
              Discovery
            </Button>
            <Button variant="ghost" render={<Link to="/curated" />}>
              Curated
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
          </nav>
        </div>
      </header>

      <SectionDivider />
    </>
  )
}

export default Header
