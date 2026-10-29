import type { APIRoute, GetStaticPaths } from 'astro'
import { allLocales } from '@/config'
import { stageData } from '@/lib/home/stage.mjs'

/**
 * One machine per file, for the four the page does not inline.
 *
 * The stage inlines the console and the machine that boots; the rest are 80% of
 * a 1 MB document and none of them is on screen at first paint, so they are
 * fetched after `load` and inserted into the same `<svg>`. This endpoint serves
 * exactly the markup the page would have contained, built by the same
 * `stageData()` the page uses — one builder, no second copy to drift.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = []
  for (const lang of allLocales) {
    const data = await stageData(lang)
    for (const index of [1, 2, 3, 4]) {
      paths.push({
        params: { part: `${lang}-${index}` },
        props: { markup: data.modules[index] },
      })
    }
  }
  return paths
}

export const GET: APIRoute = ({ props }) =>
  new Response(props.markup as string, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
    },
  })
