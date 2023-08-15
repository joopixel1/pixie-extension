# Pixie-extension README

---

This is a vscode extension with various tools to improve ur coding experience in vscode. For now, it includes a TodoPanel, colorworkbench tool and polacode tool, more to come!!

## Features
This extension currently has 3 tools:

<details>
<summary>TodoPanel</summary>

    A view in the panel of vscode extension. It gets all files and lines with todo phrases: "# todo, // Todo" in ur workspace, folder or file. Note: case does not matter.


    You can right click on a folder or file in the explorer to check for todos in ur file or folder.The aim is to help with workflow, where u can write todo comments in ur project and can later just check the todo panel to reminfd u of feature in ur code left to complete.
</details>


<details>
<summary>Polacode 📸</summary>

    A tool that helps u take beatiful pictures of ur code. You can simply
    enable it by Pixie: Polacode in ur command palette. You can copy a code in ur editor and paste in the webview to see a beautiful pic of ur code u can share with others.

    You can also select a piece of code in ur editor and right click and select Polacode to create a polacode of ur selection
</details>

<details>
<summary>Color Workbench</summary>

    You can stylize ur workbench to a particular color. U can either use the command "Pixie: Surprise me with a color" or "Pixie: Choose a color for ur workbench" which pulls an input boc in which u can enter an hex formatted rgb color.


    The aim is that u can identify ur workspaces with the color of their workbenches.
</details>



> #Todo-Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

This extension uses npm packages - color, glob, vivus and dom2image - in addition to vscode extension api

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues



## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of Polacode Extension

### 1.0.1

Coming!!

---



## For more information

* To learn more about how this was made [Visual Studio Code's Extension API](https://code.visualstudio.com/api)

**Enjoy!**
