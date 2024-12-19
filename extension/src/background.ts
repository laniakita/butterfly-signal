import { mainHandler } from "./lib_v2/core";

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("trying from tab active call.")
  console.log(activeInfo);
  (async () => await mainHandler())();
});
