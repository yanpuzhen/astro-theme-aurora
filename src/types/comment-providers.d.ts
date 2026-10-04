declare module 'valine' {
  const Valine: new (options: Record<string, unknown>) => unknown
  export default Valine
}

declare module 'twikoo' {
  const twikoo: {
    init(options: Record<string, unknown>): Promise<void>
    getRecentComments(options: Record<string, unknown>): Promise<unknown>
  }
  export default twikoo
}
