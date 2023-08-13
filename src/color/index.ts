import * as vscode from 'vscode';
import * as Color from 'color';
import { colorObject } from './color-object';


export function color(): vscode.Disposable {
    return vscode.commands.registerCommand('pixie.color', () => {
        const config = vscode.workspace.getConfiguration('workbench');

        vscode.window.showInputBox(
            {
                title: "Input a color",
                placeHolder: "please write the color as hex format rgb javascript string"
            }
        )
        .then(
            (randomColor) => {
                const col = colorObject(randomColor);

                if (col === undefined){
                    vscode.window.showErrorMessage('Input of Wrong Format, try an hexadecimal rgb color string!');
                }
                else {
                    config.update('colorCustomizations', col, false)
                        .then(() => {
                            vscode.window.showInformationMessage('Surprise!');
                        });
                }
            },
            (e) => console.log(e),
        );
    });
}


export function surpriseColor(): vscode.Disposable {
    return vscode.commands.registerCommand('pixie.surpriseColor', () => {
        const config = vscode.workspace.getConfiguration('workbench');

        const randomColor = Color.rgb(Math.random()*255, Math.random()*255, Math.random()*255).hex();
        const col = colorObject(randomColor);

        if (col === undefined){
            vscode.window.showErrorMessage('Sorri, something went wrong');
        }
        else {
            config.update('colorCustomizations', col, false)
                .then(() => {
                    vscode.window.showInformationMessage('Surprise!');
                });
        }
    });
}


export function removeColors(): vscode.Disposable {
    return vscode.commands.registerCommand('pixie.removeColor', () => {
        const config = vscode.workspace.getConfiguration('workbench');

        config.update('colorCustomizations', undefined, false)
            .then(() => {
                vscode.window.showInformationMessage('Removed!');
            });
    });

}

