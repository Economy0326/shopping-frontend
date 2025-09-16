const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8080", 
      changeOrigin: true,
      cookieDomainRewrite: "localhost",    // 쿠키 Domain을 프론트 호스트(보통 localhost)로 교정
      pathRewrite: { "^/api": "/api/v1" }, // ← /api/foo → /api/v1/foo 로 변환
    })
  );
};