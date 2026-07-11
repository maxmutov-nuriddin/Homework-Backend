require("dotenv").config();
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB ga ulandi"))
  .catch((err) => console.error("❌ MongoDB xatosi:", err));

const bot = new Telegraf(process.env.BOT_TOKEN);

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

bot.start(async (ctx) => {
  const telegramId = ctx.from.id;
  const ism = ctx.from.first_name || "Foydalanuvchi";

  try {
    let user = await User.findOne({ id: telegramId });

    if (!user) {
      user = await User.create({
        id: telegramId,
        ism: ism,
        firstSeenAt: new Date(),
      });

      await ctx.reply(
        `Salom ${ism} 🔥\nMen seni birinchi marta ko'ryapman.\nSana: ${formatDate(user.firstSeenAt)}`
      );
    } else {
      await ctx.reply(
        `Qaytib kelding ${ism} 🎉\nSen birinchi marta ${formatDate(user.firstSeenAt)} kuni kelgansan.`
      );
    }
  } catch (err) {
    console.error("/start xatosi:", err);
    await ctx.reply("❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
});

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

bot.command("count", async (ctx) => {
  try {
    const count = await User.countDocuments();
    await ctx.reply(`📊 Bazadagi umumiy foydalanuvchilar soni: ${count} ta`);
  } catch (err) {
    console.error("/count xatosi:", err);
    await ctx.reply("❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
});

bot.launch(() => console.log("🤖 Bot ishga tushdi!"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
