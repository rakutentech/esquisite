export interface Options {
  env: Record<string, any>;
  include: string;
  jar: string;
  maxHeap: string;
  ttl: number;
}

export default async function plantuml(source: string, options: Options): Promise<string | Error>;
