// EdgeOne Makers Edge Functions —— JFClick（疾风自动点击）广告配置后端。
//
// 命名约定：路径前缀 =【消费该配置的程序名】，文件名 = 该程序下的一种资源。
//   本文件：edge-functions/jfclick/ad.js  ->  路由 https://jptool.cn/jfclick/ad
//   其他程序各自用自己目录（edge-functions/<程序名>/...），互不混淆。
//
// 功能：为 JFClick 桌面端「底部推广横幅 + 远程配置」下发广告配置。
//   - JFClick 客户端（src/ads.h）启动后后台拉取本接口，读取 slots.jfclick 的 items 随机取一条展示。
//   - 任何失败（超时 / 网络 / 解析 / 全局关闭 / 槽关闭）一律回退 JFClick 内置的自营清单，绝不影响工具本身。
//   - 发布后再改文案 / 开关广告位，只改本文件重部署即可，JFClick 客户端无需发版。
//   - 纯 JSON 透传 + 函数内自带 CORS + Cache-Control: no-store（禁缓存，改动即生效）。
//
// 点击统计：可点击条目（url 非空）的 url 一律指向统计中转路由 /jfclick/ad/go，
//   客户端点击时由 go 路由在 KV 中给该广告 id 计数，再 302 回真实落地页。
//   真实地址只存在于同目录 ad/go.js 的 TARGETS；配置下发的是中转链接，点击量可查、可对账。
//   因此每个条目的 id 必须与 ad/go.js 里 TARGETS 的 key 一一对应；新增/更换广告主时<b>两份都要改</b>。
//
// ===== 广告位条目 id 编号规范 =====
//   id 格式：ad-<渠道>-<编号>，渠道前缀固定（self=自营，ext=外部广告主），编号从 01 递增。
//   KV 点击计数 key 即 <id>:clicks，可按 id 精确对账。前缀只用于你在后台对账，不会显示在界面上。
//   ---------------------------------------------------------------------
//   id                       渠道 / 广告主说明              落地页
//   ---------------------------------------------------------------------
//   ad-jfclick-self-01       自营 · JFApi（中文轻量API调试）  https://jptool.cn
//   ad-jfclick-self-02       自营 · JFClick（自身）           https://jptool.cn
//   ad-jfclick-self-03       自营 · jptool.cn（工具集）       https://jptool.cn
//   ad-jfclick-ext-01…       （外部广告主请从此编号，并在此表补充）
//
const AD_CONFIG = {
  enabled: true,
  version: 2,
  slots: {
    // JFClick 客户端（src/ads.h 中 AD_SLOT = "jfclick"）读取的槽名，必须保持一致。
    jfclick: {
      enabled: true,
      items: [
        {
          id: "ad-jfclick-self-01",
          title: "JFApi 使用文档",
          desc: "中文轻量 API 调试，调试/编辑/文档三模式",
          url: "https://jptool.cn/jfclick/ad/go?id=ad-jfclick-self-01",
        },
        {
          id: "ad-jfclick-self-02",
          title: "JFClick 使用文档",
          desc: "免费 Windows 自动点击 / 录制回放工具",
          url: "https://jptool.cn/jfclick/ad/go?id=ad-jfclick-self-02",
        },
      ],
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