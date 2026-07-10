require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// =============================================
// 📚 QUIZ SAVOLLARI
// =============================================
const questions = [
  {
    id: 1,
    question: "🧠 1-savol: JavaScript qaysi yilda yaratilgan?",
    options: {
      A: "1993",
      B: "1995",
      C: "1998",
      D: "2000",
    },
    correct: "B",
  },
  {
    id: 2,
    question: "🧠 2-savol: Node.js nima uchun ishlatiladi?",
    options: {
      A: "Ma'lumotlar bazasi",
      B: "Dizayn yaratish",
      C: "Server tomonida JS ishlatish",
      D: "Mobil ilova",
    },
    correct: "C",
  },
  {
    id: 3,
    question: "🧠 3-savol: Telegraf nima?",
    options: {
      A: "Python kutubxonasi",
      B: "Telegram Bot Framework (Node.js)",
      C: "Ma'lumotlar bazasi",
      D: "REST API",
    },
    correct: "B",
  },
];

// =============================================
// 🔧 YORDAMCHI FUNKSIYALAR
// =============================================

/**
 * Savol uchun inline keyboard yaratadi
 * @param {number} questionId - Savol raqami (1 dan boshlanadi)
 */
function buildQuestionKeyboard(questionId) {
  const q = questions[questionId - 1];
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(`A) ${q.options.A}`, `q${questionId}:A`),
      Markup.button.callback(`B) ${q.options.B}`, `q${questionId}:B`),
    ],
    [
      Markup.button.callback(`C) ${q.options.C}`, `q${questionId}:C`),
      Markup.button.callback(`D) ${q.options.D}`, `q${questionId}:D`),
    ],
  ]);
}

/**
 * Savol matnini formatlaydi
 * @param {number} questionId - Savol raqami
 */
function buildQuestionText(questionId) {
  const q = questions[questionId - 1];
  return (
    `📋 *Savol ${questionId}/${questions.length}*\n\n` +
    `${q.question}\n\n` +
    `A) ${q.options.A}\n` +
    `B) ${q.options.B}\n` +
    `C) ${q.options.C}\n` +
    `D) ${q.options.D}`
  );
}

/**
 * Javob natijasi + Keyingi savol tugmasi bilan keyboard
 * @param {number} nextQuestionId - Keyingi savol raqami
 */
function buildNextKeyboard(nextQuestionId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("⏭ Keyingi savol", `next:${nextQuestionId}`)],
  ]);
}

/**
 * Natija + Qayta boshlash tugmasi bilan keyboard
 */
function buildRestartKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔁 Qayta boshlash", "restart")],
  ]);
}

// =============================================
// 🗂 FOYDALANUVCHI NATIJALARINI SAQLASH
// userScores: { chatId: { correct: 0, total: 0 } }
// =============================================
const userScores = {};

// =============================================
// 🚀 /start KOMANDASI
// =============================================
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;

  // Natijani noldan boshlash
  userScores[chatId] = { correct: 0 };

  await ctx.reply(
    "🎯 *Inline Quiz Botga xush kelibsiz!*\n\n" +
      "Bu test 3 ta savoldan iborat.\n" +
      "Har bir savol uchun to'g'ri javobni tanlang.\n\n" +
      "Tayyor bo'lsangiz, boshlaylik! 👇",
    { parse_mode: "Markdown" }
  );

  // 1-savolni yuborish
  await ctx.reply(buildQuestionText(1), {
    parse_mode: "Markdown",
    ...buildQuestionKeyboard(1),
  });
});

// =============================================
// 🎯 SAVOL JAVOBLARINI QAYTA ISHLASH
// q1:A, q1:B, q1:C, q1:D
// q2:A, q2:B, q2:C, q2:D
// q3:A, q3:B, q3:C, q3:D
// =============================================
bot.action(/^q(\d+):([ABCD])$/, async (ctx) => {
  const chatId = ctx.chat.id;
  const questionId = parseInt(ctx.match[1]); // Savol raqami
  const selectedAnswer = ctx.match[2];       // Tanlangan javob

  const q = questions[questionId - 1];
  const isCorrect = selectedAnswer === q.correct;

  // Natijani yangilash
  if (!userScores[chatId]) {
    userScores[chatId] = { correct: 0 };
  }
  if (isCorrect) {
    userScores[chatId].correct += 1;
  }

  // 📣 Mini popup xabari (show_alert: false = kichik toast)
  await ctx.answerCbQuery(
    isCorrect ? "✅ To'g'ri javob!" : "❌ Xato javob!",
    { show_alert: false }
  );

  // Natija matni
  const resultEmoji = isCorrect ? "✅" : "❌";
  const correctInfo = isCorrect
    ? ""
    : `\n\n💡 *To'g'ri javob:* ${q.correct}) ${q.options[q.correct]}`;

  const resultText =
    `📋 *Savol ${questionId}/${questions.length}*\n\n` +
    `${q.question}\n\n` +
    `*Sizning javobingiz:* ${selectedAnswer}) ${q.options[selectedAnswer]} ${resultEmoji}` +
    correctInfo;

  const isLastQuestion = questionId === questions.length;

  if (isLastQuestion) {
    // ✅ Oxirgi savol - natijani ko'rsatish
    const score = userScores[chatId]?.correct ?? 0;
    const medal =
      score === 3 ? "🥇" : score === 2 ? "🥈" : score === 1 ? "🥉" : "😔";

    await ctx.editMessageText(
      resultText +
        `\n\n━━━━━━━━━━━━━━━━\n` +
        `${medal} *Natija: ${score}/${questions.length}*\n` +
        (score === 3
          ? "🎉 Ajoyib! Barcha savollar to'g'ri!"
          : score === 2
          ? "👍 Yaxshi natija!"
          : score === 1
          ? "📚 Ko'proq o'qish kerak!"
          : "💪 Harakat qiling, o'rganasiz!"),
      {
        parse_mode: "Markdown",
        ...buildRestartKeyboard(),
      }
    );
  } else {
    // ⏭ Keyingi savol tugmasini ko'rsatish
    await ctx.editMessageText(resultText, {
      parse_mode: "Markdown",
      ...buildNextKeyboard(questionId + 1),
    });
  }
});

// =============================================
// ⏭ KEYINGI SAVOL
// next:2, next:3
// =============================================
bot.action(/^next:(\d+)$/, async (ctx) => {
  const nextQuestionId = parseInt(ctx.match[1]);

  await ctx.answerCbQuery(); // Popup ko'rsatmasdan tasdiqlash

  // Xabarni yangi savol bilan yangilash
  await ctx.editMessageText(buildQuestionText(nextQuestionId), {
    parse_mode: "Markdown",
    ...buildQuestionKeyboard(nextQuestionId),
  });
});

// =============================================
// 🔁 QAYTA BOSHLASH
// =============================================
bot.action("restart", async (ctx) => {
  const chatId = ctx.chat.id;

  // Natijani noldan boshlash
  userScores[chatId] = { correct: 0 };

  await ctx.answerCbQuery("🔄 Qayta boshlanmoqda...");

  // 1-savolga qaytish (xabarni yangilash)
  await ctx.editMessageText(buildQuestionText(1), {
    parse_mode: "Markdown",
    ...buildQuestionKeyboard(1),
  });
});

// =============================================
// ⚠️ XATO HANDLER
// =============================================
bot.catch((err, ctx) => {
  console.error(`❌ Xato yuz berdi [${ctx.updateType}]:`, err);
});

// =============================================
// 🤖 BOTNI ISHGA TUSHIRISH
// =============================================
bot.launch(() => {
  console.log("✅ Inline Quiz Bot ishga tushdi!");
  console.log("📋 Savollar soni:", questions.length);
  console.log("🔗 Bot username:", bot.botInfo?.username ?? "yuklanmoqda...");
});

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
