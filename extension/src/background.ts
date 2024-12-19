import { mainHandler } from "./lib_v2/core";
import { CONFIG } from "./lib_v2/config";

chrome.webNavigation.onCommitted.addListener((details) => {
  CONFIG.DEBUG && console.log("trying from onCommited call.");
  CONFIG.DEBUG && console.log(details);
  (async () => await mainHandler())();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  CONFIG.DEBUG && console.log("trying from tab active call.");
  CONFIG.DEBUG && console.log(activeInfo);
  (async () => await mainHandler())();
});
