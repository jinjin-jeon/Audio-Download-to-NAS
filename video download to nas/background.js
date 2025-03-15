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
    contexts: ["page", "selection", "link", "image", "video", "audio"] // ✅ 모든 상황에 메뉴 표시
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "audio-download") {
    if (!tab?.id) {
      return console.error('no tab id')
    }
    chrome.tabs.sendMessage(tab.id, { action: 'findVideos' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("메시지 전송 실패: "+ JSON.stringify(chrome.runtime.lastError));
      }
    });
  }
});

// 다운로드 요청 처리
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'downloadVideo') {
    const { url } = request;

    chrome.storage.sync.get(['restUrl', 'id', 'pw'], function (options) {
      const apiUrl = options.restUrl;
      const requestBody = JSON.stringify({
        url: url,
        resolution: 'audio-mp3', // 해상도 기본값 설정
        id: options.id,
        pw: options.pw
      });

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: requestBody
      })
        .then(response => response.json()) // JSON 응답 처리
        .then(data => {
          console.log("Download response:", data);
          sendResponse({ success: true, data: data }); // 응답 반환
        })
        .catch(error => {
          console.error("Download error:", error);
          sendResponse({ success: false, error: error.message }); // 오류 응답 반환
        });

      return true; // 비동기 응답을 보낼 때 필요
    });

    return true; // storage.get도 비동기이므로 true 반환
  }
});


// background.js에서 타이머를 사용하여 서비스 워커가 종료되지 않도록 유지
setInterval(() => {
  console.log("Keeping the service worker alive...");
}, 20000); // 20초마다 실행