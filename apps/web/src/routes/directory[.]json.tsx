import { createFileRoute } from '@tanstack/react-router'
import directory from '../directory.json'

export const Route = createFileRoute('/directory.json')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(directory)
      },
    },
  },
})
