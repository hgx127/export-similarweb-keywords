# Task
根据`api-info.md`提供的信息，写一个油猴（Tampermonkey）脚本，实现在similarweb.com中提取关键词数据并转换为CSV格式下载。
# Features
## 1. 抓取配置UI
> 在页面上生成一个可以设置数据抓取参数的可拖动、可折叠的浮动UI界面。标题为Keywords Downloader，尽量使用similarweb已有的css样式。
### 配置参数及字段名
* 站点域名：keys
* 开始日期：from
* 截止日期：to
* 开始页码：page (默认值为1)
### 交互及数据处理说明
1. 用户登陆进入similarweb，油猴子脚本运行，加载UI界面
2. 用户在UI界面配置相关参数后，点击`开始抓取`按钮
3. 校验用户输入：from、to均为形如`2025|11|01`的日期格式，page为正整数
4. 以`api-info.md`中的**Request Querystrings**为请求参数默认值，根据用户输入更新默认参数，生成请求参数
5. POST调用API请求数据：https://pro.similarweb.com/widgetApi/WebsiteAnalysisV2/WebsiteAnalysis/Table
6. 根据`api-info.md`中**Response Data Structure**的**TotalCount**字段计算页数，并规划后续自动数据请求。
    * 根据页数自动请求后续数据
    * 每次请求之间随机1-5秒的delay，防止被block
8. 提取合并各请求的**ResponseData.Data.Records**（关键词数据记录），并根据`api-info.md`中**数据表格字段映射表ResponseData.Data.Records[n]**的说明将所有数据转换为csv格式。
    * 注意数据清洗（Sanitizatio）防止某些字段值带有引号，导致 CSV 换行错乱
9. 构造数据、转换为 Blob 对象、触发浏览器下载。文件名为：站点域名+开始日期+截止日期+开始页码.csv