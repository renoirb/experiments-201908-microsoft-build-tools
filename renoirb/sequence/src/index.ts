export function* sequence(max: number = 10): IterableIterator<number> {
  const STOPGAP = 1000
  let iter = 0
  while (iter <= max) {
    if (iter > STOPGAP) {
      const message = `Reached iteration ${iter}, above maximum limit ${STOPGAP}.`
      throw new Error(message)
    }
    yield iter++
  }
}

export default sequence