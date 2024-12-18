import { to_mini_profile } from '../../crates/data_factory/pkg'

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(activeInfo);
  to_mini_profile();
});
