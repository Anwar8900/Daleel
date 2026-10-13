/**
 * عامل خدمة دليل القاصد — دعم العمل دون اتصال
 * مبني باستخدام Workbox (مستضاف محليًا داخل المشروع، دون أي اعتماد
 * على شبكة CDN خارجية، ليظل عامل الخدمة يعمل دائمًا).
 *
 * الاستراتيجيات:
 *   • الشبكة أولاً (NetworkFirst) لطلبات التنقل (الصفحات).
 *   • التخزين أولاً (CacheFirst) للملفات الثابتة ذات الأسماء المتغيرة.
 *   • استثناء مسارات تسجيل الدخول وروابط OAuth من التخزين المؤقت.
 */
importScripts(
  "assets/js/workbox/workbox-core.prod.js",
  "assets/js/workbox/workbox-routing.prod.js",
  "assets/js/workbox/workbox-strategies.prod.js",
  "assets/js/workbox/workbox-expiration.prod.js",
  "assets/js/workbox/workbox-cacheable-response.prod.js"
);

if (workbox) {
  /* تفعيل فوري والسيطرة على الصفحات المفتوحة حالًا */
  workbox.core.setCacheNameDetails({
    prefix: "daleelalqasid",
    suffix: "v1"
  });
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  /* ---------- مسارات وروابط مستثناة (تسجيل الدخول وOAuth) ---------- */
  var EXCLUDED = [
    /\/login/i,
    /\/signin/i,
    /\/logout/i,
    /\/auth\b/i,
    /\/oauth/i,
    /\/authorize/i,
    /\/callback/i,
    /\/token/i,
    /accounts\.google\./i,
    /login\.live\./i,
    /appleid\.apple\.com/i,
    /github\.com\/login/i,
    /facebook\.com\/(?:login|dialog)/i
  ];

  function isExcluded(url) {
    try {
      var href = url && url.href ? url.href : String(url);
      return EXCLUDED.some(function (pattern) {
        return pattern.test(href);
      });
    } catch (e) {
      return false;
    }
  }

  /* ---------- الشبكة أولاً للصفحات ---------- */
  workbox.routing.registerRoute(
    function (_ref) {
      var request = _ref.request,
          url = _ref.url;
      return request.mode === "navigate" && !isExcluded(url);
    },
    new workbox.strategies.NetworkFirst({
      cacheName: "daleel-pages",
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 40,
          purgeOnQuotaError: true
        })
      ]
    })
  );

  /* ---------- التخزين أولاً للملفات الثابتة (ذات الأسماء المتغيرة) ---------- */
  workbox.routing.registerRoute(
    function (_ref) {
      var request = _ref.request,
          url = _ref.url;
      if (isExcluded(url)) return false;
      var destination = request.destination;
      return (
        destination === "script" ||
        destination === "style" ||
        destination === "image" ||
        destination === "font"
      );
    },
    new workbox.strategies.CacheFirst({
      cacheName: "daleel-assets",
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 120,
          purgeOnQuotaError: true
        })
      ]
    })
  );
}
