require("dotenv").config();
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const User = require("./models/User");

// ─── MongoDB ga ulanish ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB ga ulandi"))
  .catch((err) => console.error("❌ MongoDB xatosi:", err));

// ─── Bot ──────────────────────────────────────────────────────────────────────
const bot = new Telegraf(process.env.BOT_TOKEN);

// Sanani formatlash yordamchi funksiya (YYYY-MM-DD)
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─── /start buyrug'i ──────────────────────────────────────────────────────────
bot.start(async (ctx) => {
  const telegramId = ctx.from.id;
  const ism = ctx.from.first_name || "Foydalanuvchi";

  try {
    // Foydalanuvchi bazada bormi?
    let user = await User.findOne({ id: telegramId });

    if (!user) {
      // Yangi foydalanuvchi — bazaga saqlash
      user = await User.create({
        id: telegramId,
        ism: ism,
        firstSeenAt: new Date(),
      });

      await ctx.reply(
        `Salom ${ism} 🔥\nMen seni birinchi marta ko'ryapman.\nSana: ${formatDate(user.firstSeenAt)}`
      );
    } else {
      // Qaytib kelgan foydalanuvchi
      await ctx.reply(
        `Qaytib kelding ${ism} 🎉\nSen birinchi marta ${formatDate(user.firstSeenAt)} kuni kelgansan.`
      );
    }
  } catch (err) {
    console.error("/start xatosi:", err);
    await ctx.reply("❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
});

// ─── /me buyrug'i ─────────────────────────────────────────────────────────────
bot.command("me", async (ctx) => {
  const telegramId = ctx.from.id;

  try {
    const user = await User.findOne({ id: telegramId });

    if (!user) {
      return ctx.reply(
        "❗ Siz hali ro'yxatdan o'tmagansiz. Iltimos, /start bosing."
      );
    }

    await ctx.reply(
      `👤 Ism: ${user.ism}\n🆔 ID: ${user.id}\n📅 Birinchi kelgan: ${formatDate(user.firstSeenAt)}`
    );
  } catch (err) {
    console.error("/me xatosi:", err);
    await ctx.reply("❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
});

// ─── /count buyrug'i ──────────────────────────────────────────────────────────
bot.command("count", async (ctx) => {
  try {
    const count = await User.countDocuments();
    await ctx.reply(`📊 Bazadagi umumiy foydalanuvchilar soni: ${count} ta`);
  } catch (err) {
    console.error("/count xatosi:", err);
    await ctx.reply("❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
});

// ─── Botni ishga tushirish ────────────────────────────────────────────────────
bot.launch(() => console.log("🤖 Bot ishga tushdi!"));

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
