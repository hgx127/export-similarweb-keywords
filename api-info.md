### Request API
https://pro.similarweb.com/widgetApi/WebsiteAnalysisV2/WebsiteAnalysis/Table
### Request Methord
POST
### Request Querystrings
| Parameter | Value | Remark |
| --- | --- | --- |
| sort | Share | 排序列，默认按点击量排序（Share） |
| asc | false | 升序排序，默认false |
| country | 999 | 流量区域，默认全球（999） |
| volumeFromValue | 1000 | 搜索体量>1000  |
| iso | %5Bobject+Object%5D | 未知 |
| from | 2025%7C11%7C01 | 数据起始日期  |
| to | 2026%7C01%7C31 | 数据截止日期 |
| isWindow | false | 时间窗口计算方式，false 表示使用固定的日历月份。如果为 true，则可能表示使用“滑动窗口”（例如过去 28 天），这会影响 from 和 to 的计算逻辑。 |
| keys | buddhastoneshop.com | 查询主体，目标域名 |
| pageFilterJson | %5B%7B%22url%22%3A%22buddhastoneshop.com%22%2C%22searchType%22%3A%22domain%22%7D%5D | 页面过滤器 (JSON) |
| includeSubDomains | true | 是否包含子域流量 |
| IncludeNoneBranded | true | 是否包含非品牌词 |
| IncludeBranded | false | 是否包含品牌词 |
| page | 1 | 页码 |
| pageSize | 100 | 每页关键词数=100 |
| timeGranularity | Monthly | 时间粒度 |
| rangeFilter | volume%2C1000%2C | 范围过滤器 |
| webSource | Total | 流量来源=全部（total），其余选项为MobileWeb活DesktopWeb |
| sourceType | organic | 流量类型=自然流量（organic） |
### Request Body
```json
[]
```
### Response Data Structure
```jsonc
{
    // 搜索引擎列表
    "SearchEngines": [
        "Baidu",
        "Bing",
        "Brave",
        "DuckDuckGo",
        "Google",
        "Naver",
        "Qwant",
        "Rambler",
        "Yahoo",
        "Yahoo Japan",
        "Yandex"
    ],
    // 关键词总数
    "TotalCount": 995,
    "Data": {
        // 关键词总数
        "KeywordsCount": 995,
        // 总点击量
        "OverallClicks": 39310.0,
        "Records": [
            {
                // 关键词
                "Keyword": "222 angel number meaning",
                // 预计点击数
                "Clicks": 5240,
                // 预计自然点击数
                "OrganicClicks": 5240.0,
                // 桌面端点击数
                "DesktopClicks": 0.0,
                // 前一时段预计点击数
                "PreviousClicksPop": 1410.0,
                // SERP特征指标数据
                "SitesData": [
                    // buddhastoneshop.com在related_questions处被推荐，推荐内容为TopUrl所包含的内容
                    {
                        "Site": "buddhastoneshop.com",
                        "Share": 1.0,
                        "PreviousShare": 1.0,
                        "Value": 5240,
                        "SerpFeatures": [
                            "related_questions"
                        ],
                        "TopUrl": "buddhastoneshop.com/blogs/news/222-angel-number-meaning-twin-flame"
                    }
                ],
                // 所选时段关键词点击占有率。指该站点拿走了该词总点击量的 13.3%。
                "Share": 0.1332994149071483,
                // 上一时段关键词点击占有率
                "PreviousSharePop": 0.2025862068965517,
                // SERP特征指标表
                "SerpFeatures": [
                    "ai_overview",
                    "featured_answer",
                    "news",
                    "organic_sitelinks",
                    "related_questions",
                    "video"
                ],
                // 最近一次抓取该词搜索结果页（SERP）的日期
                "LatestKeywordSerpDate": "2026-01-29",
                // 热门网址：承接流量最大的落地页地址
                "TopUrl": "buddhastoneshop.com/blogs/news/222-angel-number-meaning-twin-flame",
                // 变动：所选时段与前一相同时段相比点击变化的比率
                "ClicksChange": 0.06382978723404255,
                // 变动：所选时段与前一相同时段相比点击变化的比率
                "Change": 0.06382978723404255,
                // 变动类型：Positive上升，Negtive下降
                "ChangeState": "Positive",
                // 变动：所选时段与前一相同时段相比点击变化的比率
                "ClicksChangePresentation": "6.38 %",
                // 体量：所选设备和时段在google上的搜索次数
                "KwVolume": 1166960,
                // 零点击百分比：用户仅搜索，但没有点击任何搜索结果
                "ZeroClicksShare": 0.7742,
                // 平均体量：过去12个月，所有设备在google上的平均搜索量
                "KwVolumeAverage": 439684,
                // CPC：单点击成本
                "Cpc": 0.23,
                // CPC最低出价
                "CpcLowBid": 0.01,
                // CPC最高出价
                "CpcHighBid": 2.16,
                // 关键词难度：获得google搜索结果前20名的难度
                "Difficulty": 8,
                // CPC关键词竞争度
                "Competition": 2,
                // 主导搜索意图
                "PrimaryIntent": "Informational",
                // 落地页数量
                "UrlCount": 2,
                "KwWindowVolume": 0,
                "PreviousVolume": 0,
                "VolumeChangeState": "NoData",
                "VolumeChangePresentation": "-"
            }
        ]
    },
    "Header": {
        // 总点击量
        "TotalClicks": 39310.0,
        // 关键词总数
        "KeywordsCount": 995.0,
        // 总点击量
        "OverallClicks": 39310.0
    }
}
```
### 数据表格字段映射表ResponseData.Data.Records[n]

| 数据字段名 | UI字段名 | 计算方式 |
| --- | --- | --- ｜
| Keyword | 关键词 | 直接取值 |
| Clicks | 预计点击数 | 紧凑型数字格式化Intl.NumberFormat |
| Share | 点击占有率 | 百分比格式化，保留2位小数 |
| ClicksChangePresentation | 变动 | 直接取值，并根据ChangeState在数值前标记趋势，Positive 标记绿色上箭头，Negtive标记红色下箭头 |
| Difficulty | KD | 直接取值 |
| PrimaryIntent | 意图 | 直接取值 |
| KwVolume | 总搜索量 | 紧凑型数字格式化Intl.NumberFormat |
| KwVolumeAverage | 月均搜索量 | 紧凑型数字格式化Intl.NumberFormat |
| Cpc | CPC | 直接取值 |
| ZeroClicksShare | 零点击率 | 百分比格式化，保留2位小数 |
| TopUrl | 热门网址 | 直接取值 |
| SitesData | SERP | 遍历SitesData数组，取出所有成员的SerpFeatures，转换为以英文逗号分隔的字符串 |

