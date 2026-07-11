require("dotenv/config");
const { Telegraf } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ Xato: BOT_TOKEN topilmadi! .env faylini tekshiring.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  const name = ctx.from.first_name || "foydalanuvchi";

  ctx.reply(
    `Assalomu alaykum, ${name}! Men Mini Menu botman. 🤖\n\n` +
      `Quyidagi buyruqlardan foydalanishingiz mumkin:\n` +
      `/about — Bot haqida ma'lumot\n` +
      `/help  — Buyruqlar ro'yxati`
  );
});

bot.help((ctx) => {
  ctx.reply(
    `📋 Buyruqlar ro'yxati:\n\n` +
      `/start — Botni ishga tushirish va salomlashish\n` +
      `/help  — Barcha buyruqlar va ularning izohi\n` +
      `/about — Bot muallifi haqida ma'lumot`
  );
});

bot.command("about", (ctx) => {
  ctx.reply(
    `ℹ️ Bu bot haqida:\n\n` +
      `🤖 Nomi: Mini Menu Bot\n` +
      `👨‍💻 Muallif: Nuriddin Maxmutov\n` +
      `🛠  Texnologiya: Node.js + Telegraf\n` +
      `📚 Maqsad: 24-dars amaliy vazifasi`
  );
});

bot
  .launch()
  .then(() => {
    console.log("✅ Mini Menu Bot muvaffaqiyatli ishga tushdi!");
  })
  .catch((err) => {
    console.error("❌ Botni ishga tushirishda xato:", err.message);
    process.exit(1);
  });

process.once("SIGINT", () => {
  console.log("\n🛑 SIGINT qabul qilindi. Bot to'xtatilmoqda...");
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  console.log("\n🛑 SIGTERM qabul qilindi. Bot to'xtatilmoqda...");
  bot.stop("SIGTERM");
});
