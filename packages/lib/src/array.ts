export const range = (a: number, b: number) => {
  if (b === undefined) {
    b = a
    a = 1
  }
  return [...Array(b - a + 1).keys()].map(x => x + a)
}
