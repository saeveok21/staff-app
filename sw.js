// 직원앱 서비스워커: 앱 설치, 인터넷 끊김 안내, 공지 알림 표시
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

// 공지 알림 받기 (Firebase가 보낸 메시지를 휴대폰 알림으로 표시)
self.addEventListener('push', (e) => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (err) {}
  const d = p.data || {}, n = p.notification || {};
  const title = d.title || n.title || '직원앱';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || n.body || '새 소식이 있어요',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.tag || undefined,
    data: { url: d.url || './' }
  }));
});

// 알림을 누르면 직원앱을 열고 해당 공지로 이동
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (c.url.indexOf(self.registration.scope) === 0) {
        await c.focus();
        c.postMessage({ type: 'open', url: url });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
