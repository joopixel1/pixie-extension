import * as vscode from 'vscode';
import { TodoDataProvider, Obj, } from './todo-tree-data';


let dataProvider: undefined | TodoDataProvider = undefined;


export function createTodoTree(): vscode.Disposable {
    vscode.commands.executeCommand('setContext', 'myExtension.todoListForWorkspace', true);
    const config = Object.keys({ ...vscode.workspace.getConfiguration('search').get<Obj>('exclude'), ...vscode.workspace.getConfiguration('files').get<Obj>('exclude') });
    const view = vscode.window.createTreeView("TodoList", {treeDataProvider: new TodoDataProvider(config)});
    view.title = "Workspace";
    return new vscode.Disposable(() => view.dispose());	
}


export function openTodoItem(): vscode.Disposable {
    return vscode.commands.registerCommand('todo.open', (uri: vscode.Uri, line: number, length) => { 
        vscode.workspace.openTextDocument(uri).then((doc) => {
            vscode.window.showTextDocument(doc).then((editor) => {
                editor.selection = new vscode.Selection(new vscode.Position(line, 0), new vscode.Position(line, 0));
                editor.revealRange(new vscode.Range(line, 0, line, 0), vscode.TextEditorRevealType.InCenter);
            });
        });
    });
}


export function refreshTodoTree(): vscode.Disposable {
    return vscode.commands.registerCommand('todo.refresh', () => dataProvider?.refresh());
}


export function createTodoTreeForFolder(): vscode.Disposable[] {
    const diposables = [];
    diposables.push(vscode.commands.registerCommand('todo.openFolder', (uri: vscode.Uri) => { 
        vscode.commands.executeCommand('setContext', 'myExtension.todoListForWorkspace', false);
        const path = uri.fsPath;
        const config = Object.keys({ ...vscode.workspace.getConfiguration('search' ).get<Obj>('exclude'), ...vscode.workspace.getConfiguration('files').get<Obj>('exclude') });
        const view = vscode.window.createTreeView("TodoList", {treeDataProvider: new TodoDataProvider(config, path)});
        view.title = "Folder: " + path.slice(path.lastIndexOf("\\")+1);
        diposables.push(new vscode.Disposable(() => view.dispose()));	
    }));
    return diposables;
}


export function goBackToWorkSpaceTree(): vscode.Disposable[] {
    const diposables = [];
    diposables.push(vscode.commands.registerCommand("todo.openWorkspaceTodos", () => createTodoTree()));
    return diposables;
}


