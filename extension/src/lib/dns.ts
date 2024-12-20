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

export async function fetchRecord({subdomain, hostname}:{subdomain: string, hostname: string}) {
	if (CONFIG.DEBUG) console.log(`[info]: searching for TXT record on _atproto.${hostname}`);
	try {
		const fetchTxtRes = fetch(
			`https://cloudflare-dns.com/dns-query?name=${subdomain ?? '_atproto'}.${hostname}&type=TXT`,
			{
				headers: {
					accept: 'application/dns-json'
				}
			}
		).then((res) => res.json());
		return fetchTxtRes;
	} catch (err) {
		console.warn('[warn]: failed to get TXT record', err);
	}
}

