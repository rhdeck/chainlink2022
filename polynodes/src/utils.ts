export async function sleep(ms: number) {
  console.time("sleep");
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      console.timeEnd("sleep");
      resolve();
    }, ms)
  );
}
export function escape(src: string) {
  return src.replace(/"/g, '\\"');
}
