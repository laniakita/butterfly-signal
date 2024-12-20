import { CONFIG } from './config';

export async function getCurrentTab() {
	try {
		if (CONFIG.DEBUG) console.log('[info]: attempting to query current tab');

		const windowRes = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (CONFIG.DEBUG)
			console.log('[success]: found active tab in current window');

		return windowRes;
	} catch (err) {
		console.error('[error]: failed to get current tab: ', err);
	}
}

export async function setChromeKV(k: string, v: string) {
	await chrome.storage.local.set({ [`${k}`]: v }).then(() => {
		if (CONFIG.DEBUG) console.dir(`[success]: ${k} paired to ${v}`);
	});
}

export async function getChromeKV(k: string): Promise<Record<string, string>> {
	const res = await chrome.storage.local.get([`${k}`]);
	return res[k];
}

export function updateIcon({ isActive }: { isActive: boolean }) {
	if (isActive) {
		chrome.action.setIcon({
			path: '../../icons/active/bluesky-active-32.png',
		});

		if (CONFIG.DEBUG) console.log('[success]: set butterfly to illuminate');
	} else {
		chrome.action.setIcon({
			path: '../../icons/inactive/darkmode/bluesky-outline-darkmode-32.png',
		});
		if (CONFIG.DEBUG) console.log('[success]: set butterfly to outline');
	}
}
