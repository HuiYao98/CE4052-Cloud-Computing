import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "../TutorialBot";
import { translateText } from "../translate/TranslateText";
import { translateImg } from "../translate/TranslateImg";
import { translateVoice } from "../translate/TranslateVoice";

interface VoiceRecordingChoices {
    [languageCode: string]: string; // Key is string, value is string
  }
const voiceRecordingChoice : VoiceRecordingChoices = {
    "en-us" : "English",
    "cmn-Hans-CN" : "Chinese",
    "ms-MY" : "Malay",
    "th-TH" : "Thai"
}

/** Defines the conversation */
export async function translate(conversation: MyConversation, ctx: MyContext) {
    // Get input message from user to translate 
    await ctx.reply(`Please enter the text,voice recording or upload the image that you want to translate.
Enter /cancel to cancel the translation.`);
    const {message} = await conversation.wait();
    let outputPromises = [];

    // Exit if user types /cancel
    if (message?.text === "/cancel") {
        outputPromises.push(ctx.reply("Cancelled, leaving!"));
    }
    // Handle case if user uploads picture to translate -- Not done yet 
    else if (message?.photo) {
        const photo = message.photo
        outputPromises.push(ctx.reply("That is a photo! Uploading Photo for Translation..."));
        const translationPhotoPromise = conversation.external(() => translateImg(ctx, photo));
        outputPromises.push(translationPhotoPromise);
    } else if (message?.voice){
        const voice = message.voice;
        await ctx.reply("Voice Recording recieved! Uploading Voice recording for Translation...");
        const keyboard = new InlineKeyboard()
            .text("English", "en-us").text("Chinese", "cmn-Hans-CN").row()
            .text("Malay", "ms-MY").text("Thai", "th-TH");
        await ctx.reply("What language is the voice recording in?", { reply_markup: keyboard });
        const response = await conversation.waitForCallbackQuery(["en-us", "cmn-Hans-CN", "ms-MY", "th-TH"], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboard }),
        });
        if (typeof response.match === "string") {
            const languageCode = response.match
            outputPromises.push(ctx.reply("Chosen Language:" + voiceRecordingChoice[languageCode]));
            ctx.session.baseLanguage = voiceRecordingChoice[languageCode];
            const translationVoiceTextPromise = await conversation.external(() => translateVoice(ctx, voice, languageCode))
            outputPromises.push(translationVoiceTextPromise);
        }
        
    }
    else if (!message || !message.text) {
        outputPromises.push(ctx.reply(`Message not given! Please try again...`));
    }
    // Handle case for translating text message: 
    else {
        const textMsg = message.text
        const translationTextPromise = conversation.external(() => translateText(ctx, textMsg));
        outputPromises.push(ctx.reply(`Translating message: ${message.text}...`));
        outputPromises.push(translationTextPromise);
    }

    // Wait for all output promises to complete
    const promises = await Promise.all(outputPromises).then(() => {
        const lastpromise = ctx.reply("Enter /translate to translate another text or image!")
        .then(() => {return;});
    });
    return;
    
}