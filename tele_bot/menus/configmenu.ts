import { Menu } from "@grammyjs/menu";
import { MyContext } from "../TutorialBot";
import { ParseModeFlavor } from "@grammyjs/parse-mode";


export function createConfigMenu() {
    // Pre-assign config text
    const configMenuText = (baseLanguage : String, targetLanguage : String) => {
        return `<b>Translation Bot menu</b>
Base Language: ${baseLanguage}
Target Language: ${targetLanguage}
        
You can change the language settings here`;
        }
    //Define configuration menu
    const configMenu = new Menu<ParseModeFlavor<MyContext>>('main-menu-identififer')
        .submenu("Select Base Language", 'language-menu-base')
        .submenu("Select Target Language", 'language-menu-target');

    //Define language submenu
    const createLanguageMenu = (type: 'base' | 'target') => {
        //Set target or base language
        const languageMenu = new Menu<ParseModeFlavor<MyContext>>(`language-menu-${type}`);
        
        //set the languages
        const languages = ["English", "Chinese", "Malay", "Thai"];
        languages.forEach((language : string) => {
            languageMenu.text(language, async (ctx) => {

                if (type === 'base') {
                    ctx.session.baseLanguage = language;
                }
                else if (type == 'target') {
                    ctx.session.targetLanguage = language;
                }

                await ctx.replyWithHTML(`${type === 'base' ? 'Base' : 'Target'} language set to <b>${language}</b>`);
                await ctx.editMessageText(
                    configMenuText(ctx.session.baseLanguage, ctx.session.targetLanguage), 
                    { parse_mode : "HTML" , reply_markup: configMenu }
                    );
            });
        });

        languageMenu.back("Go Back");

        return languageMenu;
    };

    //Create  menu objects
    const baseLanguageMenu = createLanguageMenu('base');
    const targetLanguageMenu = createLanguageMenu('target');

    // Register settings menus at main menu
    configMenu.register(baseLanguageMenu);
    configMenu.register(targetLanguageMenu);

    return {MainObj: configMenu, MenuText : configMenuText};
}


