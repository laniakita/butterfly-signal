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
import { getChromeKV, getCurrentTab } from "./chrome-utils";
import { fetchRecord, hostnameFromUrl } from "./dns";
import { to_mini_profile } from '../../../crates/data_factory/pkg/data_factory';

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
    const message = `[${this.name}]: ${this.message}. ${this.cause ? `${this.cause}.` : ''}`;
    return message
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

export async function getCachedProfile(key: string) {
  try {
    const cachedRes = await getChromeKV(key);
    if (cachedRes) {
      return cachedRes;
    }
    return undefined;
  } catch (err) {
    console.error("[error]: Couldn't get cache. See output below.", err);
  }
}

export async function mainHandler() {
  try {
    console.log("test main function");
    const key = await keyFromTab();
    console.log(key);

    // check if key is valid
    if (!key || (key && key.split(".").length <= 1)) {
      throw new Error(`[400]: Oops ${key} is not a valid key!`);
    }

    const subdomain = "_atproto";
    const atProtoRes = await fetchRecord({ subdomain, hostname: key });
    console.log(atProtoRes);
    if (!atProtoRes?.Answer?.[0]?.name) {
      throw new ButterflySignalError({
        name: "404_DNS_QUERY_ERROR",
        message: `Couldn't find AtProto TXT file on ${subdomain}.${key}`,
        cause: 'No "Answer" array in response, or Answer[0].name does not exist',
      });
    }
    
    const profile = await agent.app.bsky.actor.getProfile({actor: key})
    if (!profile.success) {
      throw new ButterflySignalError({
        name: "ATPROTO_GET_ERROR",
        message: `Couldn't get ${key}'s profile via AtProto`,
        cause: profile,
      });
    }
    //console.log(profile)
    
    const resPro = to_mini_profile(profile);
    console.log(resPro)

    /**
     *  At this point, we can assume the 'key' has a TXT file on _atproto.key
     *  So we'll check if the data for this 'key' is already in local storage
     */
    //const cachedProfileRes = undefined; //await getCachedProfile(key);
    
    //  console.log(`[info]: cached data not found for ${key} ... first time, huh? ;)`);
      
    
  } catch (err) {
    if (err instanceof ButterflySignalError) {
      switch(err.name) {
        case "404_DNS_QUERY_ERROR": 
          console.warn(err.messageGen());
          break;
        case "ATPROTO_GET_ERROR":
          console.warn(err.messageGen());
          break;
        default:
          console.error(err.messageGen());
      }
    } else {
      console.error(err);
    }
  }
}
