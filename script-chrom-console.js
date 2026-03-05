(async function() {
    const { v4: uuidv4 } = await import('https://jspm.dev/uuid');
    // --- 配置与参数 ---
    const API_URL = "https://pro.similarweb.com/widgetApi/WebsiteAnalysisV2/WebsiteAnalysis/Table";
    const DEFAULT_PARAMS = {
        sort: "Share",
        asc: "false",
        country: 999,
        volumeFromValue: 1000,
        iso: "[object Object]",
        isWindow: "false",
        includeSubDomains: "true",
        IncludeNoneBranded: "true",
        IncludeBranded: "false",
        pageSize: 100,
        timeGranularity: "Monthly",
        rangeFilter: "volume,1000,",
        webSource: "Total",
        sourceType: "organic"
    };

    // --- 注入 CSS 样式 ---
    const style = document.createElement('style');
    style.textContent = `
        #sw-downloader-panel {
            position: fixed; top: 100px; left: 20px; width: 280px;
            background: #fff; border: 1px solid #ddd; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; font-family: "Roboto", sans-serif;
        }
        #sw-header {
            background: #191e3d; color: white; padding: 10px; border-top-left-radius: 8px; border-top-right-radius: 8px;
            cursor: move; display: flex; justify-content: space-between; align-items: center; user-select: none;
        }
        #sw-content { padding: 15px; }
        .sw-field { margin-bottom: 12px; }
        .sw-field label { display: block; font-size: 12px; color: #555; margin-bottom: 4px; font-weight: bold; }
        .sw-field input { width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        #sw-start-btn {
            width: 100%; padding: 10px; background: #fb7d33; color: white; border: none;
            border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.2s;
        }
        #sw-start-btn:hover { background: #e66a22; }
        #sw-start-btn:disabled { background: #ccc; cursor: not-allowed; }
        #sw-status { margin-top: 10px; font-size: 11px; color: #666; text-align: center; line-height: 1.4; }
        .minimized #sw-content { display: none; }
    `;
    document.head.appendChild(style);

    // --- UI 构建 ---
    if (document.getElementById('sw-downloader-panel')) document.getElementById('sw-downloader-panel').remove();
    
    const panel = document.createElement('div');
    panel.id = 'sw-downloader-panel';
    panel.innerHTML = `
        <div id="sw-header">
            <span>Keywords Downloader</span>
            <button id="sw-toggle" style="background:none; border:none; color:white; cursor:pointer; font-weight:bold;">–</button>
        </div>
        <div id="sw-content">
            <div class="sw-field">
                <label>站点域名 (keys)</label>
                <input type="text" id="sw-keys" placeholder="buddhastoneshop.com">
            </div>
            <div class="sw-field">
                <label>开始日期 (from)</label>
                <input type="text" id="sw-from" value="2025|11|01">
            </div>
            <div class="sw-field">
                <label>截止日期 (to)</label>
                <input type="text" id="sw-to" value="2026|01|31">
            </div>
            <div class="sw-field">
                <label>开始页码 (page)</label>
                <input type="number" id="sw-page" value="1" min="1">
            </div>
            <button id="sw-start-btn">开始抓取</button>
            <div id="sw-status">就绪 (DevTools Mode)</div>
        </div>
    `;
    document.body.appendChild(panel);

    // --- 交互逻辑 (拖拽与折叠) ---
    const btn = document.getElementById('sw-start-btn');
    const status = document.getElementById('sw-status');
    document.getElementById('sw-toggle').onclick = () => panel.classList.toggle('minimized');

    let isDragging = false, offset = [0, 0];
    const header = document.getElementById('sw-header');
    header.onmousedown = (e) => {
        isDragging = true;
        offset = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY];
    };
    window.onmousemove = (e) => {
        if (isDragging) {
            panel.style.left = (e.clientX + offset[0]) + 'px';
            panel.style.top = (e.clientY + offset[1]) + 'px';
        }
    };
    window.onmouseup = () => isDragging = false;

    // --- 核心逻辑 ---
    btn.onclick = async () => {
        const keys = document.getElementById('sw-keys').value.trim();
        const from = document.getElementById('sw-from').value.trim();
        const to = document.getElementById('sw-to').value.trim();
        const startPage = parseInt(document.getElementById('sw-page').value);

        if (!keys || !from.includes('|') || isNaN(startPage)) {
            alert("参数输入不完整或格式有误！");
            return;
        }

        btn.disabled = true;
        let allRecords = [];
        let currentPage = startPage;
        let totalPages = 1;

        try {
            while (currentPage <= totalPages) {
                status.innerText = `正在抓取第 ${currentPage} / ${totalPages === 1 ? '?' : totalPages} 页...`;
                
                const response = await fetchData(keys, from, to, currentPage);
                const data = await response.json();

                if (currentPage === startPage) {
                    const totalCount = data.TotalCount || 0;
                    totalPages = Math.ceil(totalCount / DEFAULT_PARAMS.pageSize);
                    if (totalPages === 0) { status.innerText = "无数据"; break; }
                }

                if (data.Data && data.Data.Records) {
                    allRecords = allRecords.concat(data.Data.Records);
                    status.innerText = `已获取 ${allRecords.length} 条数据...`;
                }

                if (currentPage >= totalPages) break;

                // 模拟真人：随机延迟 1-5 秒
                const delay = Math.floor(Math.random() * 4000) + 1000;
                await new Promise(r => setTimeout(r, delay));
                currentPage++;
            }

            if (allRecords.length > 0) {
                status.innerText = "正在清洗数据并导出...";
                downloadCSV(allRecords, keys, from, to, startPage);
                status.innerText = `完成！成功导出 ${allRecords.length} 条数据`;
            } else {
                status.innerText = "未抓取到有效记录";
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            status.innerHTML = `<span style="color:red">抓取失败: ${err.message}</span>`;
        } finally {
            btn.disabled = false;
        }
    };

    // 使用 Fetch 代替 GM_xmlhttpRequest
    async function fetchData(keys, from, to, page) {
        const params = {
            ...DEFAULT_PARAMS,
            keys,
            from,
            to,
            page,
            pageFilterJson: JSON.stringify([{ url: keys, searchType: "domain" }])
        };

        const queryString = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
        const url = `${API_URL}?${queryString}`;

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Sw-Page": location.href,
                "X-Sw-Page-View-Id": uuidv4(),
                "X-Requested-With": "XMLHttpRequest"
            },
            body: "[]"
        });
    }

    // CSV 处理与下载逻辑
    function downloadCSV(records, keys, from, to, page) {
        const numFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
        const pctFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 });

        const headers = ["关键词", "预计点击数", "点击占有率", "变动", "KD", "意图", "总搜索量", "月均搜索量", "CPC", "零点击率", "热门网址", "SERP"];
        
        const rows = records.map(r => {
            // 解析 SERP 字段
            const serpFeatures = r.SitesData ? [...new Set(r.SitesData.flatMap(s => s.SerpFeatures || []))].join(', ') : '';
            
            // 变动趋势符号
            const trend = r.ChangeState === "Positive" ? "↑ " : (r.ChangeState === "Negative" ? "↓ " : "");
            const changeVal = r.ClicksChangePresentation || "-";

            const data = [
                r.Keyword,
                numFormatter.format(r.Clicks || 0),
                pctFormatter.format(r.Share || 0),
                trend + changeVal,
                r.Difficulty,
                r.PrimaryIntent,
                numFormatter.format(r.KwVolume || 0),
                numFormatter.format(r.KwVolumeAverage || 0),
                r.Cpc,
                pctFormatter.format(r.ZeroClicksShare || 0),
                r.TopUrl,
                serpFeatures
            ];

            // 清洗 CSV 特殊字符：引号转义，并用双引号包裹
            return data.map(val => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",");
        });

        const csvContent = "\ufeff" + [headers.join(",")].concat(rows).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `${keys}_${from.replace(/\|/g,'')}_${to.replace(/\|/g,'')}_p${page}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }
})();