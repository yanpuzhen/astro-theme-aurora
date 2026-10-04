import { init as walineInit, RecentComments } from '@waline/client/full'
import styleUrl from '@waline/client/waline.css?url'

function init(options: Parameters<typeof walineInit>[0]) {
  return walineInit({ ...options, emoji: false, reaction: false })
}

export { init, RecentComments, styleUrl }
