import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "../TutorialBot";
import { translateText } from "../TranslateText";

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
        outputPromises.push(ctx.reply("That is a photo! Translating Photo..."));
    } else if (!message || !message.text) {
        outputPromises.push(ctx.reply(`Message not given! Please try again...`));
    }
    // Handle case for translating text message: 
    else {
        const translationPromise = translateText(ctx, message?.text);
        outputPromises.push(ctx.reply(`Translating message: ${message.text}...`));
        outputPromises.push(translationPromise);
    }

    // Wait for all output promises to complete
    const promises = await Promise.all(outputPromises);
    const lastpromise = await ctx.reply("Enter /translate to translate another text or image!");
    return;
}