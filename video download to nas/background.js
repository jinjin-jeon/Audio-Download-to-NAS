console.log("Service Worker started.");
// URL 유효성 검증
function isUrl(text) {
  const pattern = /^(http|https):\/\/[^\s/$.?#].[^\s]*$/i;
  return pattern.test(text);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "audio-download",
    title: "Audio download",
    contexts: ['all'] 
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "audio-download") {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'findVideos' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("메시지 전송 실패: ", chrome.runtime.lastError);
        }
      });
    }
  }
});

// 다운로드 요청 처리
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'downloadVideo') {
    const { url } = request;

    chrome.storage.sync.get(['restUrl', 'id', 'pw'], function(options) {
      const request = new Request(options.restUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          url: url,
          resolution: 'audio-mp3', // 해상도 기본값 설정
          id: options.id,
          pw: options.pw
        })
      });

      fetch(request);
    });
  }
});
