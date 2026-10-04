import Valine from 'valine'
import AV from 'leancloud-storage'

/** Valine otherwise injects LeanCloud's SDK from jsDelivr at runtime. */
export default class LocalValine {
  constructor(options: Record<string, unknown>) {
    const appId = String(options.appId || '')
    const appKey = String(options.appKey || '')
    const suffix = appId.slice(-9)
    const region = suffix === '-9Nh9j0Va' ? 'tab.' : suffix === '-MdYXbMMI' ? 'us.' : ''
    AV.init({ appId, appKey, serverURLs: `https://${region}leancloud.cn` })
    ;(globalThis as typeof globalThis & { AV?: typeof AV }).AV = AV
    // Valine has no supported emoji-off option. An empty map prevents Sina
    // image rendering in comments; removing its control prevents a dead panel.
    new Valine({ ...options, emojiMaps: {} })
    const host = options.el
    if (host instanceof HTMLElement) {
      host.querySelector('.vemoji-btn')?.remove()
      host.querySelector('.vemojis')?.remove()
    }
  }
}
