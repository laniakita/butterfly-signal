import { CONFIG } from "./config";

export function hostnameFromUrl(url: string | null): string | undefined {
	try {
		if (CONFIG.DEBUG) console.log(`[info]: attempting to get hostname from ${url}`);
		if (!url) throw new Error();
		const newUrl = new URL(url);
		const hostRes = newUrl.hostname;
    const re = /^www\./;
		const hostname = hostRes.replace(re, '');
		if (CONFIG.DEBUG) console.log(`[success]: found ${hostname}`);
		return hostname;
	} catch (err) {
		console.error('[error]: hostname extraction failed: ', err);
	}
}