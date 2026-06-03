export function constructAcceptValue(extensions) {
  return extensions.map((e) => `.${e}`).join(",");
}
