import { mainHandler } from './lib/handlers';
import { CONFIG } from './lib/config';

chrome.webNavigation.onCommitted.addListener((details) => {
	CONFIG.DEBUG && console.log('trying from onCommited call.');
	CONFIG.DEBUG && console.log(details);
	(async () => await mainHandler())();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
	CONFIG.DEBUG && console.log('trying from tab active call.');
	CONFIG.DEBUG && console.log(activeInfo);
	(async () => await mainHandler())();
});
