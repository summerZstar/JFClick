# (追加内容) 粘贴到 jptool-vite/docs/edge-functions.md 的「二、函数清单」小节之后

---

## 四（续）. 广告点击统计中转路由（点击 = 可结算指标）

> 把下面这段按 Markdown 追加进 `docs/edge-functions.md`。

### 广告点击统计中转路由（点击 = 可结算指标）
- **文件**：`edge-functions/jfclick/ad/go.js`、`edge-functions/jfapi/ad/go.js`
- **路由**：`GET /jfclick/ad/go?id=<adId>`、`GET /jfapi/ad/go?id=<adId>`
- **作用**：客户端点击广告时先在此计一次点击，再 `302` 回真实落地页。
- **KV 计数 key**（绑定变量名固定 `AD_KV`）：
  - `<程序>:ad:<adId>:clicks` —— 点击总数（每次 +1）
  - `<程序>:ad:<adId>:last`   —— 最后点击时间戳(ms)
- **前端零改动**：落地地址只存在各 go 路由文件的 `TARGETS`；`ad.js` 配置条目里的 `url` 就是中转链接，客户端照常打开。
- **必改提醒**：`ad.js` 条目 `id` 与对应 `go.js` 的 `TARGETS` key 必须一致；新增/替换广告主两处同步改（换落地地址只改 `go.js` 的 `TARGETS`）。
- **部署前置（一次性）**：EdgeOne 控制台 → KV 存储 → 申请开通 → 创建命名空间 → 绑定本项目，绑定变量名填 `AD_KV`。未绑定时代码自动降级为直接跳转，仅丢失计数，不影响功能。
- **id 编号规范**：`ad-<渠道>-<编号>`，`self`=自营、`ext`=外部广告主，编号从 01 递增；前缀仅用于后台对账，不显示在界面。