import { Bot, Context, InlineKeyboard, SessionFlavor, session } from "grammy";
import { Menu } from "@grammyjs/menu";
import { InputFile } from "grammy/out/types.node";
import * as fs from 'fs';
import { translateText } from "./translate/TranslateText";
import { createConfigMenu } from "./menus/configmenu";
import { bold, fmt, hydrateReply, italic, link } from "@grammyjs/parse-mode";
import type { ParseModeFlavor } from "@grammyjs/parse-mode";
import {
    type Conversation,
    type ConversationFlavor,
    conversations,
    createConversation,
  } from "@grammyjs/conversations";
import { translate } from "./conversations/conversationfuncs";
import config from './config/endpoints.config'
import { FileFlavor, hydrateFiles } from "@grammyjs/files";

//Setting interface
export interface BotConfig {
    baseLanguage: String;
    targetLanguage: String;
}

// Custom types for conversations and parse-mode and having sessions
export type MyContext = FileFlavor<Context> & ConversationFlavor & SessionFlavor<BotConfig> ;
export type MyConversation = Conversation<MyContext>;

// Token
const token = config.TELEGRAM_BOT_API_TOKEN;
// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot<ParseModeFlavor<MyContext>>(token); // <-- put your bot token between the ""

// Create List of commands to show in menu
bot.api.setMyCommands([
    {command: "start", description: "Instructions"},
    {command: "config", description: "Language configuration"},
    {command: "translate", description: "Initiate Translation"},
])

// Create Configurations Menu:
const configMenuObj = createConfigMenu();

// Install the various plugins.
bot.api.config.use(hydrateFiles(bot.token));
bot.use(hydrateReply);
// Install session middleware, and define the initial session value.
function initial(): BotConfig {
    return { baseLanguage: 'English',
    targetLanguage: 'Chinese', };
  }
bot.use(session({ initial }));
bot.use(conversations());

// Install Conversation builder functions:
bot.use(createConversation(translate));

//Bot to use main menu
bot.use(configMenuObj.MainObj);

// Always exit any conversation upon /cancel
bot.command("cancel", async (ctx : MyContext) => {
    await ctx.conversation.exit();
    await ctx.reply("Leaving.");
  });

//Handle the command /config
bot.command("config", async (ctx) => {
    // Send the menu
    await ctx.replyWithHTML(
        configMenuObj.MenuText(
            ctx.session.baseLanguage, ctx.session.targetLanguage), 
            { reply_markup: configMenuObj.MainObj });
});

// Handles the command /translate - enters a conversation
bot.command("translate", async (ctx) => {
    await ctx.conversation.enter("translate");
});

bot.command("start", async (ctx) => {
    await ctx.replyWithHTML(`Welcome to <b>Language Translation Bot!</b>

You can first set the base and target language to translate to using the /config command. 
Once the languages have been set, you can use the /translate command to start translating!`);
});
/*
//Handle pictures - not edited yet
bot.on("message:photo", async (ctx) => {
    try {
        const photo = ctx.message?.photo;
        //check last photo
        const fileId = photo?.[photo.length - 1].file_id
        if (fileId) {

            //Get the fileUrl
            const file_info = await ctx.getFile();
            //const file_id = file_info.file_id;
            const file_path = file_info.file_path;
            const url = `https://api.telegram.org/file/bot${token}/${file_path}`
            await ctx.reply(url)
            //download photo
            const filePath = `./tempStorage/${fileId}.jpg`;
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(buffer));


            // Delete the downloaded photo from the local storage
            fs.unlinkSync(filePath);

            await ctx.reply("Uploading successful")
        }

    }
    catch (error) {
        console.error('Error', error);
        await (ctx.reply("An error occured while processing the photo."));
    }
})

*/
//handle any messages
bot.on("message:text", async (ctx) => {
    const message = ctx.message.text;
    console.log("Normal Message Written");
    await ctx.reply("Invalid input, please start with one of the commands in the Menu!");
});

// Start the bot.
bot.start();