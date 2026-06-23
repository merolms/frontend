export function constructAcceptValue(extensions: string[]): string {
  return extensions.map((e) => `.${e}`).join(",");
}
