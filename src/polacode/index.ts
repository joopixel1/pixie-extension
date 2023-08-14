import * as vscode from 'vscode';
import { PolacodePanel } from './polacode';


/**
 * registers extension pixie.activatePolacode,
 * which creates or reveals a polacode webview
 * @param context vscode.ExtensionContext
 * @returns vscode.Disposable
 */
export function activatePolacode(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.commands.registerCommand('pixie.activatePolacode', () => PolacodePanel.getInstance(context).createPanel());
}


/**
 * registers a webviewPanelSerializer for polacode webview,
 * which stores state of webview
 * @param context vscode.ExtensionContext
 * @returns vscode.Disposable
 */
export function polacodeSerializer(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerWebviewPanelSerializer('polacode', PolacodePanel.getInstance(context).createSerializer());
}


/**
 * registers extension pixie.openPolacodeFromSelection,
 * which creates a webview polacode froma selection already made and copies the selection to the polacode webview 
 * @param context vscode.ExtensionContext
 * @returns vscode.Disposable
 */
export function openPolacodeFromSelection(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.commands.registerCommand('pixie.openPolacodeFromSelection', () => PolacodePanel.getInstance(context).openPanelFromSelection());
}
