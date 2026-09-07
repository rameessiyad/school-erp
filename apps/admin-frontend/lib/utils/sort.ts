export function sortByNumberInName<T extends { name?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const numA = parseInt(a.name?.match(/\d+/)?.[0] ?? "0", 10);
    const numB = parseInt(b.name?.match(/\d+/)?.[0] ?? "0", 10);
    return numA - numB;
  });
}
