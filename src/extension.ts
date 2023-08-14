// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as color_extension from './color/index';
import * as todo_extension from './todo/index';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pixie-extension" is now active!');

	
	// activates commands for color extension
	context.subscriptions.push(color_extension.color());
	context.subscriptions.push(color_extension.surpriseColor());
	context.subscriptions.push(color_extension.removeColors());

	
	// activates commands for todo extension
	context.subscriptions.push(todo_extension.createTodoTree());
	context.subscriptions.push(...todo_extension.createTodoTreeForWorkspace());	
	context.subscriptions.push(...todo_extension.createTodoTreeForFolder());
	context.subscriptions.push(...todo_extension.createTodoTreeForFile());
	context.subscriptions.push(todo_extension.refreshTodoTree());
	context.subscriptions.push(todo_extension.openTodoItem());

	

}

// This method is called when your extension is deactivated
export function deactivate() {}
