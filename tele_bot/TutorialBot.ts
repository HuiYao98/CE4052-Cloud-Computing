import { Bot, InlineKeyboard } from "grammy";

//Setting interface
interface BotConfig {
    baseLanguage: String;
    targetLanguage: String;
}

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot("6991582486:AAGVKAI23eL1dKKZ-Lv-S3o3KGcKh_tSIP4"); // <-- put your bot token between the ""

//Pre-assign menu text
const firstMenu = "<b>Translation Bot menu<b>/n/n You can change the language settings here";
const languageMenu = "<b>Translation Bot menu<b>/n/n Select a language!"

//Pre assigned button 
const setBaseLanguage = "Base Language";
const setTargetLanguage = "Target Language";

//Set language here
const english = "English";
const chinese = "Chinese";
const malay = "malay";
const thai = "thai";

//Build keyboards
const menuMarkup = new InlineKeyboard().text(setBaseLanguage, setTargetLanguage);
const languageMenuMarkUp = new InlineKeyboard()
    .text(english, "english")
    .text(chinese, "chinese")
    .text(malay, "malay")
    .text(thai, "thai");

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

//handle the /menu command 
//This handler sends a menu with the inline buttons we pre-assigned above
// bot.command("menu", async (ctx) => {
//     await ctx.reply(firstMenu, {
//         parse_mode: "HTML",
//         reply_markup: menuMarkup,
//     });
// });

// //handle the set base language button 
// bot.callbackQuery(setBaseLanguage, async (ctx) => {
//     //Update the message content with the corresponding menu section 
//     await ctx.editMessageText(languageMenu, {
//         reply_markup: languageMenuMarkUp,
//         parse_mode: "HTML",
//     })
// });

// bot.callbackQuery(setTargetLanguage, async (ctx) => {
//     //Update the message content with the corresponding menu section 
//     await ctx.editMessageText(languageMenu, {
//         reply_markup: languageMenuMarkUp,
//         parse_mode: "HTML",
//     })
// });


//handle any messages
bot.on("message", async (ctx) => {
    //Print to console
    // console.log(
    //     `${ctx.from.first_name} wrote ${"text" in ctx.message ? ctx.message.text : ""
    //     }`,
    // );
    //print to console
    console.log(ctx.message);

    const message = ctx.message.text;
    //Send reply
    if (message) {
        await ctx.reply(message);
    }

});
// Start the bot.
bot.start();