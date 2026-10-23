// 직원앱 설치용 서비스워커: 앱 설치를 가능하게 하고, 인터넷이 끊겼을 때 안내만 보여줍니다.
// 앱 내용은 매번 Apps Script에서 새로 불러오므로 따로 저장(캐시)하지 않습니다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

const OFFLINE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  + '<body style="margin:0;font-family:sans-serif;background:#f5f3ee;color:#1c1f1e;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center">'
  + '<div><div style="font-size:20px;font-weight:700">인터넷에 연결되어 있지 않아요</div>'
  + '<p style="color:#6a6f6c">와이파이나 데이터를 확인한 뒤 다시 열어주세요</p>'
  + '<button onclick="location.reload()" style="font-size:16px;padding:10px 18px;border-radius:12px;border:1px solid #ccc;background:#fff">다시 시도</button></div></body>';

self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
