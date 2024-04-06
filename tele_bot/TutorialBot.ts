import { Bot, InlineKeyboard } from "grammy";
import { Menu } from "@grammyjs/menu";

//Setting interface
interface BotConfig {
    baseLanguage: String;
    targetLanguage: String;
}

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot("6991582486:AAGVKAI23eL1dKKZ-Lv-S3o3KGcKh_tSIP4"); // <-- put your bot token between the ""

// //Pre-assign menu text
const mainMenuText = "<b>Translation Bot menu</b>\n\n You can change the language settings here\n";
const languageMenuText = "<b>Translation Bot menu</b>\n\n Select a language!"

const mainMenu = new Menu('main-menu-identififer')
    .submenu("Select Base Language", 'language-menu')
    .submenu("Select Target Language", 'language-menu');



const languageSettings = new Menu('language-menu')
    .text("English", (ctx) => ctx.reply("English"))
    .text("Chinese", (ctx) => ctx.reply("Chinese"))
    .text("Malay", (ctx) => ctx.reply("Malay"))
    .text("Thai", (ctx) => ctx.reply("Thai"))
    .back("Go Back");

//Register settings menu at main menu.
mainMenu.register(languageSettings);

bot.use(mainMenu);

bot.command("menu", async (ctx) => {
    // Send the menu.
    await ctx.reply(mainMenuText, { reply_markup: mainMenu });
});


// //Pre assigned button 
// const baseLanguage = "Base Language";
// const targetLanguage = "Target Language";

// //Set language
// const languagePairs = [
//     ["English", "english"],
//     ["Chinese", "chinese"],
//     ["Malay", "malay"],
//     ["Thai", "thai"],
// ]

// //Building menu 
// const mainMenu = new Menu(mainMenuText)
//     .text(baseLanguage, 'select-base-language')
//     .text(targetLanguage, 'select-target-language');

// //Build keyboards
// const menuMarkup = new InlineKeyboard()
//     .text(baseLanguage, 'select-base-language')
//     .text(targetLanguage, 'select-target-language');

// const languageListRow = languagePairs
//     .map(([label, data]) => InlineKeyboard.text(label, data));

// const languageListMarkup = languageListRow;
// ;

// // Handle the /start command.
// bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

// //handle the /menu command 
// //This handler sends a menu with the inline buttons we pre - assigned above
// bot.command("menu", async (ctx) => {
//     await ctx.reply(mainMenu, {
//         parse_mode: "HTML",
//         reply_markup: menuMarkup,
//     });
// });

// // handle the call back for select-base-language
// bot.callbackQuery("select-base-language", async (ctx) => {
//     //Update the message content with the corresponding menu section 
//     await ctx.answerCallbackQuery(
//         const main = new
//     )
// });



// bot.callbackQuery('select-target-language', async (ctx) => {
//     //Update the message content with the corresponding menu section
//     await ctx.editMessageText(languageMenu, {
//         reply_markup: languageListMarkup,
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