import * as vscode from 'vscode';
import { TodoDataProvider, Obj, } from './todo-tree-data';


let dataProvider: undefined | TodoDataProvider = undefined;


export function createTodoTree(): vscode.Disposable {
    const config = Object.keys({ ...vscode.workspace.getConfiguration('search').get<Obj>('exclude'), ...vscode.workspace.getConfiguration('files').get<Obj>('exclude') });
    const view = vscode.window.createTreeView("TodoList", {treeDataProvider: new TodoDataProvider(config)});
    view.title = "Workspace";
    vscode.commands.executeCommand('setContext', 'pixie.todoListForWorkspaceContext', true);
    return new vscode.Disposable(() => view.dispose());	
}


export function createTodoTreeForWorkspace(): vscode.Disposable[] {
    const diposables = [];
    diposables.push(vscode.commands.registerCommand("pixie.todoListForWorkspace", () => createTodoTree()));
    return diposables;
}


export function createTodoTreeForFolder(): vscode.Disposable[] {
    const diposables = [];
    diposables.push(vscode.commands.registerCommand('pixie.todoListForFolder', (uri: vscode.Uri) => { 
        const path = uri.fsPath;
        console.log(path);
        const config = Object.keys({ ...vscode.workspace.getConfiguration('search' ).get<Obj>('exclude'), ...vscode.workspace.getConfiguration('files').get<Obj>('exclude') });
        const view = vscode.window.createTreeView("TodoList", {treeDataProvider: new TodoDataProvider(config, path)});
        view.title = "Folder: " + path.slice(path.lastIndexOf("\\")+1);
        diposables.push(new vscode.Disposable(() => view.dispose()));	
    }));
    vscode.commands.executeCommand('setContext', 'pixie.todoListForWorkspaceContext', false);
    return diposables;
}


export function createTodoTreeForFile(): vscode.Disposable[] {
    const diposables = [];
    diposables.push(vscode.commands.registerCommand('pixie.todoListForFile', (uri: vscode.Uri) => { 
        const path = uri.fsPath;
        const config = Object.keys({ ...vscode.workspace.getConfiguration('search' ).get<Obj>('exclude'), ...vscode.workspace.getConfiguration('files').get<Obj>('exclude') });
        const view = vscode.window.createTreeView("TodoList", {treeDataProvider: new TodoDataProvider(config, undefined, path)});
        view.title = "Folder: " + path.slice(path.lastIndexOf("\\")+1);
        diposables.push(new vscode.Disposable(() => view.dispose()));	
    }));
    vscode.commands.executeCommand('setContext', 'pixie.todoListForWorkspaceContext', false);
    return diposables;
}



export function refreshTodoTree(): vscode.Disposable {
    return vscode.commands.registerCommand('pixie.refreshTodoList', () => dataProvider?.refresh());
}


export function openTodoItem(): vscode.Disposable {
    return vscode.commands.registerCommand('pixie.openTodoItem', (uri: vscode.Uri, line: number, length) => { 
        vscode.workspace.openTextDocument(uri).then((doc) => {
            vscode.window.showTextDocument(doc).then((editor) => {
                editor.selection = new vscode.Selection(new vscode.Position(line, 0), new vscode.Position(line, 0));
                editor.revealRange(new vscode.Range(line, 0, line, 0), vscode.TextEditorRevealType.InCenter);
            });
        });
    });
}









