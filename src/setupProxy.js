const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://<백엔드-IP>:4000", // 예: http://192.168.0.23:4000
      changeOrigin: true,
      cookieDomainRewrite: "localhost",   // 쿠키 도메인을 localhost로 교정
    })
  );
};
