import { to_mini_profile } from "../../../crates/data_factory/pkg/data_factory";
import { fetchProfile, nullMiniProfile, type MiniProfile } from "./bsky/utils";
import { getCachedProfile } from "./cache";
import { setChromeKV, updateIcon } from "./chrome-utils";
import { CONFIG } from "./config";
import { hasAtProtoRecord, keyFromTab } from "./dns";
import { ButterflySignalError } from "./error";

export async function handleKey(): Promise<string | undefined> {
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

export async function handleMiniProfileUpdate(
  key: string,
  validRec: boolean
): Promise<MiniProfile> {
  try {
    if (validRec) {
      const profile = await fetchProfile(key);

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

export async function handleCached(key: string): Promise<MiniProfile> {
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

    return await handleMiniProfileUpdate(key, await hasAtProtoRecord(key));
  }

  const tDelta =
    (Date.now() - new Date(cachedProfileRes.updated).getTime()) / 1000;

  if (tDelta > CONFIG.REVALIDATE) {
    CONFIG.DEBUG &&
      console.log(
        `[info]: ${tDelta}s > ${CONFIG.REVALIDATE}s -> profile data stale -> Revalidating cache`
      );
    return await handleMiniProfileUpdate(key, await hasAtProtoRecord(key));
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

    // 1. Build query key
    const key = await handleKey();
    // very important!
    if (key) {
      // 2. Query local storage
      const profileData = await handleCached(key);

      // 3a. Update icon to active
      if (profileData?.handle !== null) {
        updateIcon({ isActive: true });
        CONFIG.DEBUG && console.log("[success]: BskyData update complete");
        //return profileData;
      } else {
        // 3b. Update icon to inactive
        updateIcon({ isActive: false });
        if (CONFIG.DEBUG) console.log("[success]: null update complete");
        //return profileData;
      }
    } else {
      updateIcon({ isActive: false });
      if (CONFIG.DEBUG) console.log("[success]: null update complete");
    }
  } catch (err) {
    if (err instanceof ButterflySignalError) {
      console.warn(err.messageGen());
    } else {
      console.error(err);
    }
  }
}
