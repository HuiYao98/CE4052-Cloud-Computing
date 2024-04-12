import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "../TutorialBot";
import { translateText } from "../translate/TranslateText";
import { translateImg } from "../translate/TranslateImg";

/** Defines the conversation */
export async function translate(conversation: MyConversation, ctx: MyContext) {
    // Get input message from user to translate 
    await ctx.reply(`Please enter the text or upload the image that you want to translate.
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
    } else if (!message || !message.text) {
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
    const promises = await Promise.all(outputPromises);
    const lastpromise = await ctx.reply("Enter /translate to translate another text or image!");
    return;
}