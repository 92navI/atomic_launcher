export type Last<T extends unknown[]> = T extends [...unknown[], infer L]
  ? L
  : never;
export type Init<T extends unknown[]> = T extends [...infer I, unknown]
  ? I
  : never;
