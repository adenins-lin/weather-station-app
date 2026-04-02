const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 定義記憶體快取變數
let cachedWeatherData = ''; 
const fileId = '12R1lPqj7IrjRgDz-NXtW9Uq15ptRzLyN';

// --- 核心：伺服器背景自動抓取資料 ---
async function fetchFromGoogleDrive() {
    try {
        const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}&t=${Date.now()}`;
        // 伺服器端發送請求
        const response = await fetch(driveUrl);
        
        if (response.ok) {
            cachedWeatherData = await response.text();
            console.log(`[${new Date().toLocaleTimeString()}] ✅ 成功更新氣象快取資料`);
        } else {
            console.error('⚠️ Google Drive 狀態異常:', response.status);
        }
    } catch (error) {
        console.error('❌ 伺服器抓取資料失敗:', error);
    }
}

// 1. 伺服器啟動時，先抓第一次資料
fetchFromGoogleDrive();

// 2. 設定計時器：伺服器每 60,000 毫秒 (1分鐘) 自動去 Google Drive 更新一次
setInterval(fetchFromGoogleDrive, 60000); 

// 設定讓前端網頁 (index.html) 可以被讀取
app.use(express.static(__dirname));

// --- 專屬 API：應付前端千軍萬馬 ---
app.get('/api/weather', (req, res) => {
    // 當有 100 個香客的手機打開網頁來討資料，伺服器直接把「快取」丟出去！
    if (cachedWeatherData) {
        res.send(cachedWeatherData);
    } else {
        res.status(503).send('伺服器正在連線氣象站，請稍後...');
    }
});

// 啟動伺服器監聽
app.listen(port, () => {
    console.log(`🔥 氣象站伺服器已成功啟動於 port ${port}`);
});