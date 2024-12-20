import type { MiniProfile } from "./bsky/utils";
import { getChromeKV } from "./chrome-utils";

export async function getCachedProfile(key: string): Promise<MiniProfile | undefined> {
  try {
    if (!key) throw new Error("Key is undefined!");
    const cachedRes = (await getChromeKV(key)) as unknown as string;
    if (cachedRes) {
      return JSON.parse(cachedRes);
    }
    return undefined;
  } catch (err) {
    console.error("[error]: Couldn't get cache. See output below.", err);
  }
}