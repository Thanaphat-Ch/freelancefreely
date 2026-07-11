let setLoadingRef = null

export const loadingStore = {
  set(fn) {
    setLoadingRef = fn
  },
  show() {
    setLoadingRef?.(true)
  },
  hide() {
    setLoadingRef?.(false)
  },
}
