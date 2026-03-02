// ==UserScript==
// @name         Similarweb Keywords Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Export Similarweb keywords to CSV based on API info
// @author       hgx127
// @match        https://pro.similarweb.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      pro.similarweb.com
// ==/UserScript==

(function() {
    'use strict';

    // --- 配置与常量 ---
    const API_URL = "https://pro.similarweb.com/widgetApi/WebsiteAnalysisV2/WebsiteAnalysis/Table";
    const DEFAULT_PARAMS = {
        sort: "Share",
        asc: "false",
        country: "999",
        volumeFromValue: "1000",
        iso: "[object Object]",
        isWindow: "false",
        includeSubDomains: "true",
        IncludeNoneBranded: "true",
        IncludeBranded: "false",
        pageSize: "100",
        timeGranularity: "Monthly",
        rangeFilter: "volume,1000,",
        webSource: "Total",
        sourceType: "organic"
    };

    // --- UI 构建 ---
    GM_addStyle(`
        #sw-downloader-panel {
            position: fixed; top: 100px; left: 20px; width: 280px;
            background: #fff; border: 1px solid #ddd; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; font-family: "Roboto", sans-serif;
        }
        #sw-header {
            background: #191e3d; color: white; padding: 10px; border-top-left-radius: 8px; border-top-right-radius: 8px;
            cursor: move; display: flex; justify-content: space-between; align-items: center;
        }
        #sw-content { padding: 15px; }
        .sw-field { margin-bottom: 12px; }
        .sw-field label { display: block; font-size: 12px; color: #555; margin-bottom: 4px; }
        .sw-field input { width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        #sw-start-btn {
            width: 100%; padding: 10px; background: #fb7d33; color: white; border: none;
            border-radius: 4px; cursor: pointer; font-weight: bold;
        }
        #sw-start-btn:disabled { background: #ccc; cursor: not-allowed; }
        #sw-status { margin-top: 10px; font-size: 11px; color: #666; text-align: center; }
        .minimized #sw-content { display: none; }
    `);

    const panel = document.createElement('div');
    panel.id = 'sw-downloader-panel';
    panel.innerHTML = `
        <div id="sw-header">
            <span>Keywords Downloader</span>
            <button id="sw-toggle" style="background:none; border:none; color:white; cursor:pointer;">_</button>
        </div>
        <div id="sw-content">
            <div class="sw-field">
                <label>站点域名 (keys)</label>
                <input type="text" id="sw-keys" placeholder="e.g. example.com">
            </div>
            <div class="sw-field">
                <label>开始日期 (from: YYYY|MM|DD)</label>
                <input type="text" id="sw-from" placeholder="2025|11|01">
            </div>
            <div class="sw-field">
                <label>截止日期 (to: YYYY|MM|DD)</label>
                <input type="text" id="sw-to" placeholder="2026|01|31">
            </div>
            <div class="sw-field">
                <label>开始页码 (page)</label>
                <input type="number" id="sw-page" value="1" min="1">
            </div>
            <button id="sw-start-btn">开始抓取</button>
            <div id="sw-status">就绪</div>
        </div>
    `;
    document.body.appendChild(panel);

    // --- 交互逻辑 ---
    const btn = document.getElementById('sw-start-btn');
    const status = document.getElementById('sw-status');
    
    // 折叠功能
    document.getElementById('sw-toggle').onclick = () => panel.classList.toggle('minimized');

    // 拖拽功能
    let isDragging = false, offset = [0, 0];
    const header = document.getElementById('sw-header');
    header.onmousedown = (e) => {
        isDragging = true;
        offset = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY];
    };
    document.onmousemove = (e) => {
        if (isDragging) {
            panel.style.left = (e.clientX + offset[0]) + 'px';
            panel.style.top = (e.clientY + offset[1]) + 'px';
        }
    };
    document.onmouseup = () => isDragging = false;

    // --- 核心逻辑 ---
    btn.onclick = async () => {
        const keys = document.getElementById('sw-keys').value.trim();
        const from = document.getElementById('sw-from').value.trim();
        const to = document.getElementById('sw-to').value.trim();
        const startPage = parseInt(document.getElementById('sw-page').value);

        // 校验
        const dateRegex = /^\d{4}\|\d{2}\|\d{2}$/;
        if (!keys || !dateRegex.test(from) || !dateRegex.test(to) || isNaN(startPage)) {
            alert("请输入正确的参数格式！");
            return;
        }

        btn.disabled = true;
        let allRecords = [];
        let currentPage = startPage;
        let totalPages = 1;

        try {
            while (currentPage <= totalPages) {
                status.innerText = `正在抓取第 ${currentPage} 页...`;
                
                const response = await fetchData(keys, from, to, currentPage);
                const data = JSON.parse(response.responseText);

                if (currentPage === startPage) {
                    const totalCount = data.TotalCount || 0;
                    totalPages = Math.ceil(totalCount / 100);
                }

                if (data.Data && data.Data.Records) {
                    allRecords = allRecords.concat(data.Data.Records);
                }

                if (currentPage >= totalPages) break;

                // 随机延迟 1-5秒
                const delay = Math.floor(Math.random() * 4000) + 1000;
                await new Promise(r => setTimeout(r, delay));
                currentPage++;
            }

            status.innerText = "正在生成 CSV...";
            downloadCSV(allRecords, keys, from, to, startPage);
            status.innerText = "下载完成";
        } catch (err) {
            console.error(err);
            status.innerText = "抓取失败，请检查控制台";
        } finally {
            btn.disabled = false;
        }
    };

    function fetchData(keys, from, to, page) {
        const params = {
            ...DEFAULT_PARAMS,
            keys,
            from,
            to,
            page,
            pageFilterJson: JSON.stringify([{ url: keys, searchType: "domain" }])
        };

        const queryString = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: `${API_URL}?${queryString}`,
                data: "[]",
                headers: { "Content-Type": "application/json" },
                onload: resolve,
                onerror: reject
            });
        });
    }

    function downloadCSV(records, keys, from, to, page) {
        const numFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
        const pctFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 });

        const headers = ["关键词", "预计点击数", "点击占有率", "变动", "KD", "意图", "总搜索量", "月均搜索量", "CPC", "零点击率", "热门网址", "SERP"];
        
        const rows = records.map(r => {
            // 处理 SERP: 遍历 SitesData 提取 SerpFeatures
            const serpFeatures = r.SitesData ? [...new Set(r.SitesData.flatMap(s => s.SerpFeatures || []))].join(', ') : '';
            
            // 处理变动趋势符号
            const trend = r.ChangeState === "Positive" ? "↑ " : (r.ChangeState === "Negative" ? "↓ " : "");
            const changeLabel = trend + (r.ClicksChangePresentation || "-");

            const data = [
                r.Keyword,
                numFormatter.format(r.Clicks || 0),
                pctFormatter.format(r.Share || 0),
                changeLabel,
                r.Difficulty,
                r.PrimaryIntent,
                numFormatter.format(r.KwVolume || 0),
                numFormatter.format(r.KwVolumeAverage || 0),
                r.Cpc,
                pctFormatter.format(r.ZeroClicksShare || 0),
                r.TopUrl,
                serpFeatures
            ];

            // 数据清洗：转义引号并包裹
            return data.map(val => {
                const str = String(val === undefined || val === null ? "" : val);
                return `"${str.replace(/"/g, '""')}"`;
            }).join(",");
        });

        const csvContent = "\ufeff" + [headers.join(",")].concat(rows).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${keys}_${from.replace(/\|/g,'')}_${to.replace(/\|/g,'')}_p${page}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
})();