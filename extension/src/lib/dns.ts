import { getCurrentTab } from './chrome-utils';
import { CONFIG } from './config';
import { ButterflySignalError } from './error';

export function hostnameFromUrl(url: string | null): string | undefined {
	try {
		if (CONFIG.DEBUG)
			console.log(`[info]: attempting to get hostname from ${url}`);
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

export async function keyFromTab(): Promise<string | undefined> {
	try {
		const tabRes = await getCurrentTab();
		if (tabRes?.[0] && 'url' in tabRes[0]) {
			const tabUrl = tabRes[0].url ?? null;
			const hostnameKey = hostnameFromUrl(tabUrl);
			return hostnameKey;
		}
	} catch (err) {
		console.error(
			"[error]: Couldn't build hostname key from tab. see output:",
			err,
		);
	}
}

export async function fetchAtProtoRecord({
	subdomain,
	hostname,
}: { subdomain: string; hostname: string }) {
	if (CONFIG.DEBUG)
		console.log(`[info]: searching for TXT record on _atproto.${hostname}`);
	try {
		const fetchTxtRes = fetch(
			`https://cloudflare-dns.com/dns-query?name=${subdomain ?? '_atproto'}.${hostname}&type=TXT`,
			{
				headers: {
					accept: 'application/dns-json',
				},
			},
		).then((res) => res.json());
		return fetchTxtRes;
	} catch (err) {
		console.error('[error]: failed to get TXT record', err);
	}
}

export async function hasAtProtoRecord(key: string): Promise<boolean> {
	try {
		const subdomain = '_atproto';
		const atProtoRes = await fetchAtProtoRecord({ subdomain, hostname: key });

		if (!atProtoRes?.Answer?.[0]?.name) {
			throw new ButterflySignalError({
				name: '404_DNS_QUERY_ERROR',
				message: `Couldn't find AtProto TXT file on ${subdomain}.${key}`,
				cause:
					'No "Answer" array in response, or Answer[0].name does not exist',
			});
		}

		return true;
	} catch (err) {
		if (err instanceof ButterflySignalError) {
			console.error(err.messageGen());
			return false;
		}
		console.error(err);
		return false;
	}
}
