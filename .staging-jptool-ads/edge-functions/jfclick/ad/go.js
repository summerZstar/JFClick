// EdgeOne Makers Edge Functions —— JFClick 广告「点击统计 + 跳转」。
//
// 路由：https://jptool.cn/jfclick/ad/go?id=<adId>   （源码 edge-functions/jfclick/ad/go.js）
//
// 功能：JFClick 客户端点击底部推广横幅时，先请求这里做“点击计数”，再 302 回真实落地页。
//   - 点击/打开是自营招商里最有结算价值的指标，这里在 KV 中对 <id>:clicks 累加。
//   - 展示数不在此统计（桌面端上报易丢失、不可靠），如需展示量请另设上报通道。
//
// KV 计数 key：
//   jfclick:ad:<id>:clicks   —— 点击总数（每次 +1）
//   jfclick:ad:<id>:last     —— 最后一次点击的时间戳（毫秒）
//
// ===== TARGETS：adId → 真实落地页 映射 =====
//   必须与上级 ad.js 配置中各条目的 id、以及其注释里的渠道/广告主表一一对应。
//   广告主换真实地址只需改这一处；ad.js 里的 url 永远指向本路由，无需动。
//   ---------------------------------------------------------------------
//   id                       渠道 / 广告主说明              落地页
//   ---------------------------------------------------------------------
//   ad-jfclick-self-01       自营 · JFApi（中文轻量API调试）  https://jptool.cn
//   ad-jfclick-self-02       自营 · JFClick（自身）           https://jptool.cn
//   ad-jfclick-self-03       自营 · jptool.cn（工具集）       https://jptool.cn
//   （新增外部广告主请在此表补充，并同时在上方 ad.js 配置里加条目）
//
const TARGETS = {
  "ad-jfclick-self-01": "https://jptool.cn/modules/jfapi/index.html",
  "ad-jfclick-self-02": "https://jptool.cn/modules/jfclick/index.html",
};

// 取绑定到本项目的 KV 命名空间（绑定变量名固定 AD_KV）。
// 需先在 EdgeOne 控制台：KV 存储 → 创建命名空间 → 绑定本项目 → 变量名填 AD_KV。
function kvFrom(env) {
  return (env && env.AD_KV) || null;
}

export async function onRequest(context) {
  const req = (context && context.request) || new Request("https://local/");
  const url = new URL(req.url);

  if (String(req.method).toUpperCase() === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Max-Age": "86400" },
    });
  }

  const id = url.searchParams.get("id") || "";
  const target = TARGETS[id];
  if (!target) {
    return new Response("bad ad id", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  // 点击计数（尽力而为：KV 未绑定或写入失败都不阻断跳转，保证用户一定能打开落地页）
  const kv = kvFrom(context.env);
  if (kv) {
    try {
      const clicksKey = "jfclick:ad:" + id + ":clicks";
      const cur = Number(await kv.get(clicksKey)) || 0;
      await kv.put(clicksKey, String(cur + 1));
      await kv.put("jfclick:ad:" + id + ":last", String(Date.now()));
    } catch (e) {
      // 忽略计数异常，直接放行跳转
    }
  }

  return Response.redirect(target, 302);
}