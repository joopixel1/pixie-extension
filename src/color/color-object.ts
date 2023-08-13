/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import * as Color from 'color';

export function colorObject(colorString: string | undefined): object | undefined {
   
    if(colorString === undefined) {return undefined;}

    let color;
    try{
        color = new Color(colorString);
    }
    catch{
        return undefined;
    }
    const primary = color.hex();
    const primaryInactive = color.alpha(99/255).hexa();
    const secondary = (color.isDark()) ? color.lighten(0.175).hex() : color.darken(0.175).hex();
    const secondaryInactive = (new Color(secondary)).alpha(99/255).hexa();
    const text = (color.isDark()) ? "#e7e7e7" : "#15202b";
    const textInactive =  (color.isDark()) ? "#e7e7e799" : "#15202b99";
    const badge = color.rotate(120).hex();
    const badgeText = ((new Color(badge)).isDark()) ? "#e7e7e7" : "#15202b";



    return {
        "titleBar.activeBackground": primary,
        "titleBar.activeForeground": text,
        "titleBar.inactiveBackground": primaryInactive,
        "titleBar.inactiveForeground": textInactive,
        "commandCenter.border": textInactive,
        "statusBar.background": primary,
        "statusBar.foreground": text,
        "statusBarItem.hoverBackground": secondary,
        "statusBarItem.remoteBackground": primary,
        "statusBarItem.remoteForeground": text,
        "activityBar.activeBackground": secondary,
        "activityBar.background": secondary,
        "activityBar.foreground": text,
        "activityBar.inactiveForeground": textInactive,
        "activityBarBadge.background": badge,
        "activityBarBadge.foreground": badgeText,
        "sash.hoverBorder": secondary,

          
    };  
}