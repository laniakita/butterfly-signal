import { agent } from "./api";
import { CONFIG } from "../config";
import { ButterflySignalError } from "../error";

export type MiniProfile = {
  avatar: string | null;
  banner: string | null;
  description: string | null;
  displayName: string | null;
  handle: string | null;
  updated: Date;
  url: string | null;
};

export const nullMiniProfile: MiniProfile = {
  avatar: null,
  banner: null,
  description: null,
  displayName: null,
  handle: null,
  updated: new Date(),
  url: null,
};

export async function fetchProfile(handle: string) {
  try {
		CONFIG.DEBUG && console.log(`[info]: Fetching ${handle}'s profile from api.bsky.app`);
    const profile = await agent.app.bsky.actor.getProfile({ actor: handle });
    
		
		if (!profile?.success) {
      
    }
    return profile;
  } catch (err) {
		if (err instanceof Error && err.message === "Profile not found") {

			const error = new ButterflySignalError({
        name: "ATPROTO_GET_ERROR",
        message: `Couldn't get ${handle}'s profile via AtProto`,
        cause: "Profile not found",
      });

      console.error(error.messageGen());
		} else {
      console.error(err);
    }
  }
}
