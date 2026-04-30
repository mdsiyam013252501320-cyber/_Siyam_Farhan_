const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const { createCanvas, loadImage } = require("canvas");
const moment = require("moment-timezone");

module.exports = {
config: {
name: "up2",
aliases: ["uptime2", "Up2"],
version: "23.0.0",
author: "SIYAM HASAN",
countDown: 5,
role: 0,
category: "system",
description: "Admin: No Prefix (61588452928616) | User: With Prefix",
usePrefix: true
},

onStart: async function ({ api, event }) {
return this.handleUptime({ api, event });
},

onChat: async function ({ api, event }) {
const { body, senderID } = event;
if (!body) return;

const adminUID = "61588452928616";
const msg = body.toLowerCase();

if (senderID == adminUID && (msg == "up" || msg == "uptime")) {
return this.handleUptime({ api, event });
}
},

handleUptime: async function ({ api, event }) {
const { threadID, messageID, senderID } = event;

// 🔍 Checking msg
const sendChecking = await api.sendMessage("🔍 Checking system status...", threadID);

// ⏱️ Time calc
const timeStart = Date.now();
const uptime = process.uptime();
const hours = Math.floor(uptime / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
const timeString = `${hours}h ${minutes}m`;

// 💾 RAM
const usedMem = ((os.totalmem() - os.freemem()) / (1024 ** 3)).toFixed(1);
const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(1);
const ramPercentage = ((usedMem / totalMem) * 100).toFixed(0);

// 📅 Date
const currentDate = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");

// 👤 User name
let userName = "User";
try {
const info = await api.getUserInfo(senderID);
userName = info[senderID].name;
} catch (e) { userName = "User"; }

// 🔥 IMAGE ROTATION SYSTEM
const imgList = [
  "https://i.imgur.com/TDkyAdv.jpeg",
  "https://i.imgur.com/Yhc606E.jpeg",
  "https://i.imgur.com/T4FOBYj.jpeg",
  "https://i.imgur.com/Wd0NyrD.jpeg"
];

if (!global._uptimeIndex) global._uptimeIndex = 0;

const imgUrl = imgList[global._uptimeIndex];
global._uptimeIndex = (global._uptimeIndex + 1) % imgList.length;

// 👤 Profile pic
const userImgUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

// 📁 Cache
const cacheDir = path.join(__dirname, "cache");
const cachePath = path.join(cacheDir, `up_siyam_${Date.now()}.png`);

try {
if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

// 🖼️ Load BG
const image = await loadImage(imgUrl);
const canvas = createCanvas(image.width, image.height);
const ctx = canvas.getContext("2d");

ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// 👤 Profile Box
const boxSize = 220;
const boxX = centerX - boxSize / 2;
const boxY = centerY - boxSize / 2 + 15;

try {
const userImg = await loadImage(userImgUrl);

ctx.shadowColor = "#00ffff";
ctx.shadowBlur = 25;
ctx.strokeStyle = "#ffffff";
ctx.lineWidth = 5;
ctx.strokeRect(boxX, boxY, boxSize, boxSize);

ctx.shadowBlur = 0;
ctx.drawImage(userImg, boxX, boxY, boxSize, boxSize);

ctx.fillStyle = "rgba(0,0,0,0.6)";
ctx.fillRect(boxX, boxY + boxSize - 35, boxSize, 35);

ctx.textAlign = "center";
ctx.fillStyle = "#ffffff";
ctx.font = "bold 16px Arial";
ctx.fillText(userName.toUpperCase(), centerX, boxY + boxSize - 12);

} catch (err) { console.log("User image fail"); }

// 🔘 Circle Function
const drawCircle = (x, y, r, percent, label, value, color) => {
ctx.beginPath();
ctx.arc(x, y, r, 0, Math.PI * 2);
ctx.strokeStyle = "rgba(255,255,255,0.1)";
ctx.lineWidth = 10;
ctx.stroke();

ctx.beginPath();
ctx.arc(x, y, r, -Math.PI/2, (-Math.PI/2)+(Math.PI*2*(percent/100)));
ctx.strokeStyle = color;
ctx.lineWidth = 10;
ctx.lineCap = "round";
ctx.stroke();

ctx.fillStyle = "#fff";
ctx.font = "bold 20px Arial";
ctx.textAlign = "center";
ctx.fillText(value, x, y+8);

ctx.font = "14px Arial";
ctx.fillText(label, x, y+35);
};

// 📊 Circles
const uptimeX = boxX - 110;
const ramX = boxX + boxSize + 110;

drawCircle(uptimeX, centerY + 30, 60, 75, "UPTIME", timeString, "#00ffcc");
drawCircle(ramX, centerY - 40, 60, ramPercentage, "RAM", `${ramPercentage}%`, "#ff3366");

const pingMS = Date.now() - timeStart;
drawCircle(ramX, centerY + 90, 50, 80, "PING", `${pingMS}ms`, "#ffff00");

// 🟢 Footer
ctx.textAlign = "center";
ctx.font = "bold 24px Arial";
ctx.fillStyle = "#00ff00";
ctx.fillText("● SYSTEM STATUS: ACTIVE", centerX, canvas.height - 65);

// 👑 Credit
ctx.font = "italic bold 18px Arial";
ctx.fillStyle = "#FFD700";
ctx.fillText("DEVELOPED BY: 👑𝐒𝐈𝐘𝐀𝐌 𝐇𝐎𝐒𝐒𝐄𝐈𝐍 👑", centerX, canvas.height - 95);

// 🤖 Bot Name
ctx.textAlign = "left";
ctx.font = "bold 30px Arial";
ctx.shadowColor = "#0000ff";
ctx.shadowBlur = 15;
ctx.fillStyle = "#33ccff";
ctx.fillText("[👑 𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓 𝐁𝐎𝐓 👑]", 180, 120);

// 📅 Date
ctx.shadowBlur = 20;
ctx.shadowColor = "#FF00FF";
ctx.textAlign = "center";
ctx.font = "bold 22px Arial";

ctx.fillStyle = "#fff";
ctx.fillText(`| ${currentDate}`, centerX + 100, 120);

ctx.shadowBlur = 0;

// 💾 Save
const buffer = canvas.toBuffer("image/png");
fs.writeFileSync(cachePath, buffer);

// 📤 Send
return api.sendMessage(
{ attachment: fs.createReadStream(cachePath) },
threadID,
async (err) => {
if (!err) api.unsendMessage(sendChecking.messageID);
if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
},
messageID
);

} catch (e) {
console.error(e);
api.unsendMessage(sendChecking.messageID);
return api.sendMessage("❌ Error generating status!", threadID, messageID);
}
}
};
