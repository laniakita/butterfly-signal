import { agent } from "./api";
import { CONFIG } from "../config";

interface MiniProfile {
	handle: string | null;
	displayName: string | null;
	description: string | null;
	avatar: string | null;
	banner: string | null;
}

export interface BskyData extends MiniProfile {
	link: string | null;
	updated: Date;
}

export async function fetchProfile(handle: string) {
	if (CONFIG.DEBUG) console.log('[info]: attempting to fetch profile via AtProto');
	try {
		const res = await agent.app.bsky.actor.getProfile({ actor: handle });
    /*
		const data: MiniProfile = res?.data && {
			handle: res.data.handle ?? null,
			displayName: res.data.displayName ?? null,
			description: res.data.description ?? null,
			avatar: res.data.avatar ?? null,
			banner: res.data.banner ?? null
		};

		if (CONFIG.DEBUG) {
			console.log(`[success]: fetched ${data.displayName}'s profile`);
			console.log(`====== begin profile ======`);
			console.dir(data, { depth: null });
			console.log(`======= end profile =======`);
		}

    */
		return res;
	} catch (err) {
		console.warn("[warn]: couldn't fetch profile", err);
	}
}