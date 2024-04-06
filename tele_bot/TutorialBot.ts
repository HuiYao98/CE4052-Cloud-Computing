import { Bot, InlineKeyboard } from "grammy";
import { Menu } from "@grammyjs/menu";
import { InputFile } from "grammy/out/types.node";
import * as fs from 'fs';

//Setting interface
interface BotConfig {
    baseLanguage: String;
    targetLanguage: String;
}

//Create config
const botConfig: BotConfig = {
    baseLanguage: 'English',
    targetLanguage: 'Spanish',
};

//token
const token = "6991582486:AAGVKAI23eL1dKKZ-Lv-S3o3KGcKh_tSIP4";
// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(token); // <-- put your bot token between the ""
// Pre-assign menu text
const mainMenuText = () => {
    return `<b>Translation Bot menu </b>


    Base Language: ${botConfig.baseLanguage}
    Target Language: ${botConfig.targetLanguage}
    
    You can change the language settings here`;
}


//set the languages
const languages = ["English", "Chinese", "Malay", "Thai"];

//Define main menu
const mainMenu = new Menu('main-menu-identififer')
    .submenu("Select Base Language", 'language-menu-base')
    .submenu("Select Target Language", 'language-menu-target');

//Define language submenu
const createLanguageMenu = (type: 'base' | 'target') => {
    //Set target or base language
    const languageMenu = new Menu(`language-menu-${type}`);

    languages.forEach((language) => {
        languageMenu.text(language, async (ctx) => {

            if (type === 'base') {
                botConfig.baseLanguage = language;
            }
            else if (type == 'target') {
                botConfig.targetLanguage = language;
            }

            await ctx.reply(`${type === 'base' ? 'Base' : 'Target'} language set to ${language}`);
            await ctx.editMessageText(mainMenuText(), { reply_markup: mainMenu });


        });
    });

    languageMenu.back("Go Back");

    return languageMenu;
};

//Create  menu objects
const baseLanguageMenu = createLanguageMenu('base');
const targetLanguageMenu = createLanguageMenu('target');

// Register settings menus at main menu
mainMenu.register(baseLanguageMenu);
mainMenu.register(targetLanguageMenu);

//Bot to use main menu
bot.use(mainMenu);

//Handle the command /menu
bot.command("menu", async (ctx) => {
    // Send the menu
    await ctx.reply(mainMenuText(), { reply_markup: mainMenu });
});

//Handle pictures
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


//handle any messages
bot.on("message:text", async (ctx) => {
    //Print to console
    console.log("In normal message handling");
    // console.log(
    //     `${ctx.from.first_name} wrote ${"text" in ctx.message ? ctx.message.text : ""
    //     }`,
    // );
    //print to console
    //console.log(ctx.message);

    const message = ctx.message.text;
    //Send reply
    if (message) {
        await ctx.reply(message);
    }

});


// Start the bot.
bot.start();