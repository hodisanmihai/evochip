// Small ranges work even when the API row limit is below its default of 1000.
export async function readAll<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ;) {
    const { data, error } = await fetchPage(from, from + 99);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data?.length) return rows;
    from += data.length;
  }
}

export async function allRows<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  try { return { data: await readAll(fetchPage), error: null }; }
  catch (error) { return { data: null, error: error as { message?: string } }; }
}
