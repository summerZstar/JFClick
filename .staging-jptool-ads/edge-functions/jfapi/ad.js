// EdgeOne Makers Edge Functions —— JFApi 桌面端广告配置后端。
//
// 命名约定：路径前缀 =【消费该配置的程序名】，文件名 = 该程序下的一种资源。
//   本文件：edge-functions/jfapi/ad.js  ->  路由 https://jptool.cn/jfapi/ad
//   其他程序各自用自己目录（edge-functions/<程序名>/...），互不混淆。
//
// 功能：为 JFApi 桌面端「通用广告容器 + 远程配置」下发广告配置。
//   发布后再改文案 / 开关某个广告位，只改本文件重部署即可，JFApi 客户端无需发版。
//   纯 JSON 透传 + 函数内自带 CORS + Cache-Control: no-store（禁缓存，改动即生效）。
//   JFApi 构建时设置 VITE_AD_CONFIG_URL=https://jptool.cn/jfapi/ad
//
// 点击统计：可点击条目（url 非空）的 url 一律指向统计中转路由 /jfapi/ad/go，
//   由 go 路由在 KV 中给该广告 id 计数，再 302 回真实落地页（与 jfclick 同机制）。
//   条目的 id 必须与同目录 ad/go.js 里 TARGETS 的 key 一一对应。
//
// ===== 广告位条目 id 编号规范 =====
//   id 格式：ad-<渠道>-<编号>，渠道前缀固定（self=自营，ext=外部广告主），编号从 01 递增。
//   ---------------------------------------------------------------------
//   id                       渠道 / 广告主说明              落地页
//   ---------------------------------------------------------------------
//   ad-jfapi-self-01         自营 · JFApi（自身）            https://jptool.cn
//   （sidebar 第二条无 url，属纯展示位，不参与跳转与计数）
//
const AD_CONFIG = {
  enabled: true,
  version: 2,
  slots: {
    sidebar: {
      enabled: true,
      items: [
        {
          id: "ad-jfapi-self-01",
          title: "JFApi 使用文档",
          desc: "调试 / 编辑 / 文档三模式，结构自动生成",
          url: "https://jptool.cn/jfapi/ad/go?id=ad-jfapi-self-01",
        },
        {
          id: "ad-jfapi-self-02",
          title: "团队协作靠 Git",
          desc: "集合直接落地为文件，冲突可视化解决",
          url: "https://jptool.cn/jfapi/ad/go?id=ad-jfapi-self-02",
        },
      ],
    },
    welcome: {
      enabled: false,
    },
  },
};

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export default function onRequest(context) {
  const req = (context && context.request) || {};
  if (String(req.method).toUpperCase() === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Max-Age": "86400" },
    });
  }
  return jsonResponse(AD_CONFIG);
}