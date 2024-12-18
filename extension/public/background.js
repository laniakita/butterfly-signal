/*
chrome.webNavigation.onCommitted.addListener((details) => {
	console.log(details);
	(async () => {
		await runOffscreen();
		//await handleUpdate();
	})();
});
*/

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(activeInfo);
});


