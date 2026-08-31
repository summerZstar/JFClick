// EdgeOne Makers Edge Functions —— JFApi 广告「点击统计 + 跳转」。
// 路由：https://jptool.cn/jfapi/ad/go?id=<adId>  （源码 edge-functions/jfapi/ad/go.js）
// 机制与 jfclick/ad/go.js 完全一致，详见该文件注释。
//
// KV 计数 key：
//   jfapi:ad:<id>:clicks   —— 点击总数
//   jfapi:ad:<id>:last     —— 最后一次点击的时间戳（毫秒）
//
// ===== TARGETS：adId → 真实落地页 映射 =====
//   必须与上级 ad.js 配置中各条目的 id 一一对应。
//   ---------------------------------------------------------------------
//   id                       渠道 / 广告主说明              落地页
//   ---------------------------------------------------------------------
//   ad-jfapi-self-01         自营 · JFApi（自身）            https://jptool.cn
//   （新增外部广告主请在此表补充，并同时在上方 ad.js 配置里加条目）
//
const TARGETS = {
  "ad-jfapi-self-01": "https://jptool.cn/modules/jfapi/index.html",
  "ad-jfapi-self-02": "https://jptool.cn/modules/jfapi/index.html#协作",
};

// 取绑定到本项目的 KV 命名空间（绑定变量名固定 AD_KV）。
function kvFrom(env) {
  return (env && env.AD_KV) || null;
}

export async function onRequest(context) {
  const req = (context && context.request) || new Request("https://local/");
  const url = new URL(req.url);
  if (String(req.method).toUpperCase() === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Max-Age": "86400" } });
  }
  const id = url.searchParams.get("id") || "";
  const target = TARGETS[id];
  if (!target) {
    return new Response("bad ad id", { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  }
  const kv = kvFrom(context.env);
  if (kv) {
    try {
      const clicksKey = "jfapi:ad:" + id + ":clicks";
      const cur = Number(await kv.get(clicksKey)) || 0;
      await kv.put(clicksKey, String(cur + 1));
      await kv.put("jfapi:ad:" + id + ":last", String(Date.now()));
    } catch (e) {
      // 忽略计数异常，直接放行跳转
    }
  }
  return Response.redirect(target, 302);
}