let counter = 0

export function uid(): string {
  counter += 1
  return `c${Date.now().toString(36)}${counter.toString(36)}`
}
