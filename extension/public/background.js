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
  (async () => {
    await runOffscreen();
    //await handleUpdate();
  })();
});

async function runOffscreen() {
  try {
    await chrome?.offscreen?.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.BLOBS],
      justification: 'Run WebAssembly in a DOM-enabled context.',
    });
    chrome.runtime.sendMessage({
      type: 'handle-update',
      target: 'offscreen-doc',
      data: 'hello from worker.',
    });
  } catch (err) {
    console.error(err);
  }
}
