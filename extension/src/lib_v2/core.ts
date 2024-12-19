/**
 * Order of Operations:
 * 1. Build query Key:
 *   a. Get URL from current/active tab -> URL
 *   b. Generate hostname from returned URL -> hostname
 * 2. Query local storage:
 *   a. Query local storage using the hostname as a key -> cached data
 *   b. If cached data exists, and isn't stale -> Cached MiniProfile
 *   c. In all other cases, fetch/save/update
 *      data into local stage -> MiniProfile
 *      I. Use returned hostname to query for a
 *      TXT record on _atproto.hostname -> Response
 *      II. If the query returns an 'Answer', instead of
 *      'Authority' (such as in the null case), fetch
 *      profile info from 'https://public.api.bsky.app'
 *      using the hostname as a profile handle. Then
 *      build a MiniProfile object -> MiniProfile
 * 3. From returned profile, handle icon update
 *   a. if the returned Promise is a valid MiniProfile, icon set active
 *   b. if the returned promis is a 'null' MiniProfile, icon set inactive
 */

import { agent } from "./bsky/api";
import {
  getChromeKV,
  getCurrentTab,
  setChromeKV,
  updateIcon,
} from "./chrome-utils";
import { fetchRecord, hostnameFromUrl } from "./dns";
import { to_mini_profile } from "../../../crates/data_factory/pkg/data_factory";
import { CONFIG } from "./config";

type ErrorName =
  | "INVALID_KEY_ERROR"
  | "404_DNS_QUERY_ERROR"
  | "ATPROTO_GET_ERROR";

export class ButterflySignalError extends Error {
  name: ErrorName;
  message: string;
  cause: unknown;

  constructor({
    name,
    message,
    cause,
  }: {
    name: ErrorName;
    message: string;
    cause?: unknown;
  }) {
    super();
    this.name = name;
    this.message = message;
    this.cause = cause;
  }

  public messageGen(): string {
    const message = `[${this.name}]: ${this.message}. ${
      this.cause ? `${this.cause}.` : ""
    }`;
    return message;
  }
}

async function keyFromTab(): Promise<string | undefined> {
  try {
    const tabRes = await getCurrentTab();
    if (tabRes?.[0] && "url" in tabRes[0]) {
      const tabUrl = tabRes[0].url ?? null;
      const hostnameKey = hostnameFromUrl(tabUrl);
      return hostnameKey;
    }
  } catch (err) {
    console.error(
      "[error]: Couldn't build hostname key from tab. see output:",
      err
    );
  }
}

type MiniProfile = {
  avatar: string | null;
  banner: string | null;
  description: string | null;
  displayName: string | null;
  handle: string | null;
  updated: Date;
  url: string | null;
};

const nullMiniProfile: MiniProfile = {
  avatar: null,
  banner: null,
  description: null,
  displayName: null,
  handle: null,
  updated: new Date(),
  url: null,
};

async function getCachedProfile(
  key: string | undefined
): Promise<MiniProfile | undefined> {
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

async function getBskyProfile(handle: string) {
  try {
    const profile = await agent.app.bsky.actor.getProfile({ actor: handle });
    if (!profile?.success) {
      throw new ButterflySignalError({
        name: "ATPROTO_GET_ERROR",
        message: `Couldn't get ${key}'s profile via AtProto`,
        cause: profile,
      });
    }
    return profile;
  } catch (err) {
    if (err instanceof ButterflySignalError) {
      console.warn(err.messageGen());
    } else {
      console.error(err);
    }
  }
}

async function handleMiniProfileUpdate(
  key: string,
  validRec: boolean
): Promise<MiniProfile> {
  try {
    if (validRec) {
      const profile = await getBskyProfile(key);

      if (profile?.success) {
        const miniProfile = to_mini_profile(profile.data);
        CONFIG.DEBUG && console.log(miniProfile);
        await setChromeKV(key, JSON.stringify(miniProfile));
        CONFIG.DEBUG && console.log("[success]: updated cache with:");
        CONFIG.DEBUG && console.dir(miniProfile, { depth: null });
        return miniProfile;
      }
    }
    CONFIG.DEBUG &&
      console.log(
        `[info]: No TXT rec on _atproto.${key} OR profile.success not found -> setting cache to null profile`
      );

    CONFIG.DEBUG && console.log(nullMiniProfile);
    await setChromeKV(key, JSON.stringify(nullMiniProfile));
    CONFIG.DEBUG && console.log("[success]: updated cache with:");
    CONFIG.DEBUG && console.dir(nullMiniProfile, { depth: null });
    return nullMiniProfile;
  } catch (err) {
    console.error(err);
    return nullMiniProfile;
  }
}

async function handleKey(): Promise<string | undefined> {
  try {
    const key = await keyFromTab();
    CONFIG.DEBUG && console.log("key:", key);

    // check if key is valid
    if (!key || (key && key.split(".").length <= 1)) {
      throw new ButterflySignalError({
        name: "INVALID_KEY_ERROR",
        message: `[400]: Oops ${key} is not a valid key!`,
      });
    }

    return key;
  } catch (err) {
    if (err instanceof ButterflySignalError) {
      console.warn(err);
    } else {
      console.error(err);
    }
    return undefined;
  }
}

async function hasAtProtoRecord(key: string): Promise<boolean> {
  try {
    const subdomain = "_atproto";
    const atProtoRes = await fetchRecord({ subdomain, hostname: key });

    if (!atProtoRes?.Answer?.[0]?.name) {
      throw new ButterflySignalError({
        name: "404_DNS_QUERY_ERROR",
        message: `Couldn't find AtProto TXT file on ${subdomain}.${key}`,
        cause:
          'No "Answer" array in response, or Answer[0].name does not exist',
      });
    }

    return true;
  } catch (err) {
    if (err instanceof ButterflySignalError) {
      console.warn(err);
      return false;
    }
    console.error(err);
    return false;
  }
}

async function handleCached(key: string): Promise<MiniProfile> {
  const cachedProfileRes = await getCachedProfile(key);

  /**
   * this way, we only do our network fetches (dns, atproto api) if we need to:
   *   1. when we've never seen this "key" before
   *   2. when the data is stale
   */

  if (!cachedProfileRes) {
    CONFIG.DEBUG &&
      console.log(
        `[info]: cached data not found for ${key} ... first time, huh? ;)`
      );
    const hasRec = await hasAtProtoRecord(key);
    return await handleMiniProfileUpdate(key, hasRec);
  }

  const tDelta =
    (Date.now() - new Date(cachedProfileRes.updated).getTime()) / 1000;

  if (tDelta > CONFIG.REVALIDATE) {
    CONFIG.DEBUG &&
      console.log(
        `[info]: ${tDelta}s > ${CONFIG.REVALIDATE}s -> profile data stale -> Revalidating cache`
      );
    const hasRec = await hasAtProtoRecord(key);
    return await handleMiniProfileUpdate(key, hasRec);
  }

  CONFIG.DEBUG &&
    console.log(
      `[info]: ${tDelta}s < ${CONFIG.REVALIDATE}s -> profile data still fresh -> returning cache`
    );
  CONFIG.DEBUG && console.log(cachedProfileRes);
  return cachedProfileRes;
}

export async function mainHandler() {
  try {
    CONFIG.DEBUG && console.log("test main function");

    const key = await handleKey();
    // very important!
    if (key) {
      // check cache
      const profileData = await handleCached(key);

      if (profileData?.handle !== null) {
        updateIcon({ isActive: true });
        CONFIG.DEBUG && console.log("[success]: BskyData update complete");
        return profileData;
      }

      updateIcon({ isActive: false });
      if (CONFIG.DEBUG) console.log("[success]: null update complete");
      return profileData;
    }
  } catch (err) {
    if (err instanceof ButterflySignalError) {
      console.warn(err.messageGen());
    } else {
      console.error(err);
    }
  }
}
