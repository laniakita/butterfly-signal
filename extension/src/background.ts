import { mainHandler } from "./lib_v2/core";

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(activeInfo);
  mainHandler()
});
