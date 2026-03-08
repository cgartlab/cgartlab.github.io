/**
 * 记忆化异步函数，按参数缓存结果
 *
 * @param fn - 需要记忆化的异步函数
 * @returns 记忆化后的函数，会缓存结果
 */
export function memoize<Args extends any[], T>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<T> {
  const cache = new Map<string, Promise<T>>()

  return async (...args: Args): Promise<T> => {
    // 根据函数参数生成缓存键
    const key = JSON.stringify(args)

    // 如果存在缓存的Promise则返回
    if (cache.has(key)) {
      return cache.get(key)!
    }

    // 执行原始函数并将Promise存入缓存
    const promise = fn(...args)
    cache.set(key, promise)

    // 从缓存中删除失败的Promise以允许重试
    promise.catch(() => {
      cache.delete(key)
    })

    return promise
  }
}
