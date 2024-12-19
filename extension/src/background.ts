import { mainHandler } from "./lib_v2/core";

chrome.webNavigation.onCommitted.addListener((details) => {
  console.log(details);
  (async () => await mainHandler())();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("trying from tab active call.");
  console.log(activeInfo);
  (async () => await mainHandler())();
});
