// 상단 버전 수정 시 메인 화면 버전도 자동으로 업데이트됩니다.
const APP_VERSION = 'v14'; 
const CACHE_NAME = `growth-diary-${APP_VERSION}`; 

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. 설치: 이전 서비스 워커를 기다리지 않고 즉시 설치
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. 활성화: 이전 버전의 캐시를 모두 삭제하고 즉시 제어
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 페치: 캐시 우선, 없으면 네트워크 요청
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

// 4. 메인 스크립트로부터 버전 요청을 받았을 때 응답
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'GET_VERSION') {
    if (e.ports && e.ports[0]) {
      e.ports[0].postMessage({ version: APP_VERSION });
    }
  }
});
