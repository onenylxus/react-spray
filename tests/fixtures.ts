export function randnum(): number {
  return Math.random();
}

export function randint(max: number): number;
export function randint(min: number, max: number): number;
export function randint(...args: [number] | [number, number]): number {
  const [min, max] = args.length === 1 ? [0, args[0]] : args;
  return Math.floor(randnum() * (max - min + 1)) + min;
}

export function randstr(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randint(chars.length));
  }
  return result;
}

export function randstrs(count: number, length: number = 32): string[] {
  return Array.from({ length: count }, () => randstr(length));
}
