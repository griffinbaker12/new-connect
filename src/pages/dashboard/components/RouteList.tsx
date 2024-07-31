import {
  createResource,
  createSignal,
  For,
  Suspense,
} from 'solid-js'
import type { VoidComponent } from 'solid-js'
import clsx from 'clsx'
import type { RouteSegments } from '~/types'
import RouteCard from '~/components/RouteCard'
import { fetcher } from '~/api'
import Button from '~/components/material/Button'

const PAGE_SIZE = 3

type RouteListProps = {
  class?: string
  dongleId: string
}

const RouteList: VoidComponent<RouteListProps> = (props) => {
  const [size, setSize] = createSignal(1)

  const fetchRoutes = async ([dongleId, page]: readonly [string, number]): Promise<RouteSegments[]> => {
    const endpoint = `/v1/devices/${dongleId}/routes_segments?limit=${PAGE_SIZE}`
    const getKey = (previousPageData?: RouteSegments[]): string | undefined => {
      if (!previousPageData) return endpoint
      if (previousPageData.length === 0) return undefined
      const lastSegmentEndTime = previousPageData.at(-1)!.end_time_utc_millis
      return `${endpoint}&end=${lastSegmentEndTime - 1}`
    }

    let result: RouteSegments[] = []
    for (let i = 0; i < page; i++) {
      const key = getKey(result)
      if (!key) break
      const newData = await fetcher<RouteSegments[]>(key)
      result = [...result, ...newData]
    }
    return result
  }

  const [routes] = createResource(() => [props.dongleId, size()] as const, fetchRoutes)

  const onLoadMore = () => setSize(size() + 1)

  return (
    <div
      class={clsx(
        'flex w-full flex-col justify-items-stretch gap-4',
        props.class,
      )}
    >
      <Suspense
        fallback={
          <>
            <div class="skeleton-loader elevation-1 flex h-[336px] max-w-md flex-col rounded-lg bg-surface-container-low" />
            <div class="skeleton-loader elevation-1 flex h-[336px] max-w-md flex-col rounded-lg bg-surface-container-low" />
            <div class="skeleton-loader elevation-1 flex h-[336px] max-w-md flex-col rounded-lg bg-surface-container-low" />
          </>
        }
      >
        <For each={routes()}>
          {(route) => <RouteCard route={route} />}
        </For>
      </Suspense>
      <div class="flex justify-center">
        <Button onClick={onLoadMore}>Load more</Button>
      </div>
    </div>
  )
}

export default RouteList
