import { getEditableCatalogItems } from '../data/picbookCatalog'
import { loadCatalogPack } from './loadCatalogPack'

let started = false

/** 앱 시작 후 팩을 미리 만들어 두어 실행 화면 멈춤을 줄인다 */
export function prewarmCatalogPacks(): void {
  if (started) return
  started = true
  const run = () => {
    for (const item of getEditableCatalogItems()) {
      if (!item.comingSoon) {
        try {
          loadCatalogPack(item)
        } catch {
          /* ignore */
        }
      }
    }
  }
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: 3000 })
  } else {
    window.setTimeout(run, 100)
  }
}
