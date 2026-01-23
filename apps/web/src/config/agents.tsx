export type Agent = {
  name: string
  logo?: string
  link: string
}

export const SUPPORTED_AGENTS: Agent[] = [
  {
    name: 'Claude Code',
    logo: '/brands/claude-code.svg',
    link: 'https://claude.com/product/claude-code',
  },
  {
    name: 'Cursor',
    logo: '/brands/cursor.png',
    link: 'http://cursor.com/',
  },
  {
    name: 'Copilot',
    logo: '/brands/github-copilot.png',
    link: 'https://github.com/features/copilot',
  },
  {
    name: 'Gemini CLI',
    logo: '/brands/gemini-cli.svg',
    link: 'https://geminicli.com/',
  },
  {
    name: 'Windsurf',
    logo: '/brands/windsurf.png',
    link: 'http://windsurf.com/',
  },
  {
    name: 'Trae',
    logo: '/brands/trae.svg',
    link: 'http://trae.ai/',
  },
  {
    name: 'Factory Droid',
    link: 'https://factory.ai/',
    logo: '/brands/factory.png',
  },
  { name: 'Letta', link: 'https://www.letta.com/', logo: '/brands/letta.png' },
  {
    name: 'OpenCode',
    logo: '/brands/opencode.svg',
    link: 'https://opencode.ai/',
  },
  {
    name: 'Codex',
    logo: '/brands/codex.png',
    link: 'https://openai.com/codex/',
  },
  {
    name: 'Antigravity',
    link: 'https://antigravity.google/',
    logo: '/brands/antigravity.png',
  },
  { name: 'Amp', link: 'http://ampcode.com/', logo: '/brands/amp.png' },
  { name: 'Kilo Code', link: 'https://kilo.ai/', logo: '/brands/kilo.png' },
  { name: 'Roo Code', link: 'https://roocode.com/', logo: '/brands/roo.png' },
  {
    name: 'Goose',
    logo: '/brands/goose.png',
    link: 'https://goose.ai/',
  },
  { name: 'Qoder', link: 'https://qoder.com/', logo: '/brands/qoder.png' },
  { name: 'Qwen Code', logo: '/brands/qwen.png', link: 'https://qwenlm.github.io/qwen-code-docs/' },
  { name: 'Clawdbot', logo: '/brands/clawdbot.svg', link: 'https://clawd.bot/' },
  { name: 'Kiro', logo: '/brands/kiro.svg', link: 'https://kiro.dev/' },
  { name: 'OpenHands', logo: '/brands/openhands.svg', link: 'https://openhands.dev/' },
  { name: 'Zencoder', logo: '/brands/zencoder.svg', link: 'https://zencoder.ai/' },
  { name: 'Neovate', logo: '/brands/neovate.svg', link: 'https://neovateai.dev/' },
  { name: 'CommandCode', logo: '/brands/command-code.svg', link: 'https://commandcode.ai/' },
]
