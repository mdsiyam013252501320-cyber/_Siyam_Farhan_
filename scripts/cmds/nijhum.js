const axios = require("axios");

const NIJHUM_API = "https://exxai.onrender.com";

// ─── Typing Indicator ─────────────────────────
const typing = async (api, threadID, ms = 2000) => {
  try {
    if (typeof api.sendTypingIndicator === "function") {
      await api.sendTypingIndicator(threadID, true);
      await new Promise(resolve => setTimeout(resolve, ms));
      await api.sendTypingIndicator(threadID, false);
    }
  } catch {}
};

// ─── Sender Name ─────────────────────────────
const getSenderName = async (usersData, senderID) => {
  try {
    return (await usersData.getName(senderID)) || "User";
  } catch {
    return "User";
  }
};

// ─── API CALL ───────────────────────────────
const askNijhum = async (message, senderName, senderID) => {
  const res = await axios.get(`${NIJHUM_API}/api/chat`, {
    params: { message, uid: senderID, name: senderName },
    timeout: 10000
  });

  if (res.data?.success && res.data?.reply) return res.data.reply;
  throw new Error(res.data?.error || "Nijhum busy 💔");
};

// ─── SEND REPLY ─────────────────────────────
const sendReply = async (message, replyText, senderID, senderName) => {
  const parts = replyText
    .split(/\n\n---\n\n|\n---\n/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    await new Promise(resolve => {
      message.reply(`🌸 নিঝুম\n━━━━━━━━━━━━━━\n${part}`, (err, info) => {
        if (!err && info?.messageID) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "nijhum",
            senderID,
            senderName
          });
        }
        resolve();
      });
    });
    if (parts.length > 1) await new Promise(r => setTimeout(r, 700));
  }
};

// ───────────────────────────────────────────
module.exports = {
  config: {
    name: "nijhum",
    aliases: ["nij", "ai", "n"],
    version: "3.0",
    author: "SIYAM FIXED",
    countDown: 0,
    role: 0,
    shortDescription: "Nijhum AI chatbot",
    category: "ai"
  },

  onStart: async function () {},

  // ─── PREFIX COMMAND ──────────────────────
  onStart: async function ({ api, event, args, message, usersData }) {
    const senderID = event.senderID;
    const threadID = event.threadID;
    const senderName = await getSenderName(usersData, senderID);
    const query = args.join(" ").trim();

    if (!query) {
      return message.reply(
        "🌸 𝗡𝗶𝗷𝗵𝘂𝗺 𝗔𝗜\n━━━━━━━━━━━━━━\n💬 .nijhum <message>\n🗣️ বা লিখো: নিঝুম <message>"
      );
    }

    try {
      await typing(api, threadID);
      const reply = await askNijhum(query, senderName, senderID);
      await sendReply(message, reply, senderID, senderName);
    } catch (err) {
      return message.reply("❌ Server busy, আবার চেষ্টা করো");
    }
  },

  // ─── REPLY CONTINUE ──────────────────────
  onReply: async function ({ api, event, message, usersData }) {
    const text = event.body?.trim();
    if (!text) return;

    const senderID = event.senderID;
    const threadID = event.threadID;
    const senderName = await getSenderName(usersData, senderID);

    try {
      await typing(api, threadID);
      const reply = await askNijhum(text, senderName, senderID);
      await sendReply(message, reply, senderID, senderName);
    } catch {
      message.reply("❌ আবার চেষ্টা করো");
    }
  },

  // ─── AUTO CHAT (বাংলা + ইংরেজি) ─────────
  onChat: async function ({ api, event, message, usersData }) {
    try {
      const raw = event.body?.trim();
      if (!raw) return;

      const lower = raw.toLowerCase();
      const senderID = event.senderID;
      const threadID = event.threadID;

      // ✅ ALL TRIGGERS
      const triggers = [
        "nijhum", "nij", "n",
        "নিঝুম", "নিজুম", "নিঝুম "
      ];

      const match = triggers.find(t => lower.startsWith(t));
      if (!match) return;

      const q = raw.slice(match.length).trim();

      if (!q) {
        return message.reply("🌸 নিঝুম আছি 💖 কিছু বলো...");
      }

      const senderName = await getSenderName(usersData, senderID);

      await typing(api, threadID);

      const reply = await askNijhum(q, senderName, senderID);

      await sendReply(message, reply, senderID, senderName);

    } catch (err) {
      console.error("CHAT ERROR:", err.message);
    }
  }
};
