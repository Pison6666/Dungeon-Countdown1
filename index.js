const { chromium } = require("playwright");
const fetch = require("node-fetch");

const webhookURL = "ใส่ webhook URL ของคุณ";

async function sendWebhook(msg) {
  await fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: msg }),
  });
  console.log("📤 ส่ง webhook:", msg);
}

async function getCountdownMs() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://dungeonallstar.netlify.app");
  await page.waitForSelector(".countdown", { timeout: 10000 });
  const time = await page.textContent(".countdown");
  await browser.close();

  const [h, m, s] = time.trim().split(":").map(Number);
  return (h * 3600 + m * 60 + s) * 1000;
}

async function loop() {
  await sendWebhook("🔁 เริ่มตรวจจับรอบดันเจี้ยน");

  while (true) {
    try {
      const ms = await getCountdownMs();
      console.log("🕐 จะรอ", ms / 1000, "วินาที");
      await new Promise(res => setTimeout(res, ms));

      await sendWebhook("🎉 ดันเจี้ยนเปิดแล้ว!");
      await new Promise(res => setTimeout(res, 30 * 60 * 1000)); // 30 นาทีช่วงเล่น
    } catch (e) {
      console.error("❌ Error:", e);
      await new Promise(res => setTimeout(res, 60000)); // รอ 1 นาทีแล้วลองใหม่
    }
  }
}

loop();
