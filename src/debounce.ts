export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  let context: any;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    context = this;
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}
