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

import { getChromeKV, keyFromTab } from './chrome-utils';
import {fetch_record, get_profile} from '@butterfly-signal/bsky_utils';

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
    console.log('test main function');
    const key = await keyFromTab();

    // check if key is valid
    if (!key || (key && key.split('.').length <= 1)) {
      throw new Error(`Oops ${key} is not a valid key!`);
    }
    console.log('trying wasm')
    const atProtoRes = await fetch_record(key);
    console.log(atProtoRes);
    console.log('added wasm')
    /*
    if (!atProtoRes?.Answer?.[0]?.name) {
      throw new Error(`Couldn't find _atproto record on ${key}`); 
    }*/

    /**
     *  At this point, we can assume the 'key' has a TXT file on _atproto.key
     *  So we'll check if the data for this 'key' is already in local storage
     */
    /* 
    const cachedProfileRes = await getCachedProfile(key);
    
    if (!cachedProfileRes) {
      console.log(`[info]: cached data not found for ${key} ... first time, huh? ;)`);
      
      const profileRes = await get_profile(key);
      console.log(profileRes);
      
    }
    
    */

  } catch (err) {
    console.error(err);
  }
}
