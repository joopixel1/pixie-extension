import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';


type SerializedState = {
    innerHTML: string;
};


/**
 * A Singleton that has only one instance of a webview PolacodePanel returned by getInstance()
 */
export class PolacodePanel {


    private static _singleton: PolacodePanel | undefined = undefined;
    private panel: vscode.WebviewPanel | undefined = undefined;
    private lastUsedImageUri = vscode.Uri.file(path.resolve(os.homedir(), 'Desktop/code.png'));
    
    private constructor(
        private readonly context: vscode.ExtensionContext,
    ) {}


    /**
     *  
     * @param cont the context of the vscode Ectension
     * @returns the only instance of the Polacode
     */
    public static getInstance(cont: vscode.ExtensionContext): PolacodePanel {
        if (this._singleton === undefined){
        this._singleton = new PolacodePanel(cont);
        }
        return this._singleton;
    }

    /**
     * If this.panel is undefined createWebviewPanel, else reveal it
     */
    public createPanel()  {
        if (this.panel) 
        {
        // If we already have a panel, show it in the target column
        this.panel.reveal(vscode.ViewColumn.Two);
        } 
        else
        {
            // Create and show a new webview
            this.panel = vscode.window.createWebviewPanel(
                'polacode', // Identifies the type of the webview. Used internally
                'Polacode 📸', // Title of the panel displayed to the user
                vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
                {
                    localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'resources')], // to dosallow all resources
                    
                    enableScripts: true, // to nable js in webview

                    // retainContextWhenHidden: true // should only be used in few cases when state logic is complex and cannot be easily persisted, cause it is very memory costly
                }
            );
            this.panel.webview.html = this.getWebviewContent();

            // init() the webviews html content
            this.panel.webview.postMessage({
                type: 'init',
                fontFamily: vscode.workspace.getConfiguration('editor').fontFamily,
                bgColor: this.context.globalState.get('polacode.bgColor', '#2e3440'),
            });

            // Activate events when extension is activated
            this.activateEvents();
            
            this.syncSettings();
        }
    }

    /**
     * 
     * @returns WebviewPanelSerializer for saving the state of webviews
     */
    public createSerializer(): vscode.WebviewPanelSerializer<SerializedState> {
        return {
            deserializeWebviewPanel: async (_panel: vscode.WebviewPanel, state: SerializedState) => {
                this.panel = _panel;
                this.panel.webview.html = this.getWebviewContent();
                
                // restore() the webviews html content
                this.panel.webview.postMessage({
                    type: 'restore',
                    innerHTML: state.innerHTML,
                    bgColor: this.context.globalState.get('polacode.bgColor', '#2e3440'),
                });
                
                // Activate events when extension is activated
                this.activateEvents();

                this.syncSettings();
            }
        };
    }
  
    /**
     * open webview panel with selection copied
     */
    public openPanelFromSelection() {     
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor){
            const selection = activeEditor.selection;
            activeEditor.revealRange(new vscode.Range(selection.start, selection.end));
            vscode.commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction');
            console.log('active');
        }
        this.createPanel();
        this.panel?.webview.postMessage({
            type: 'pasteFromSelection'
        });
    }

    /**
     * // Activate events when extension is activated
     * @param this.context 
     */
    private activateEvents() {
        

        /**
         * I dont think it is needed
         * notifies the webview panel when the selection in the textEditor changes
         */
        // const setupSelectionSync = (): vscode.Disposable => {
        //     return vscode.window.onDidChangeTextEditorSelection(e => {
        //         if (e.selections[0] && !e.selections[0].isEmpty) {
        //             vscode.commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction');
        //         }
        //     });
        // };
        /**
         * if configuration changes, let webview panel know using syncSettings()
         */
        const setupConfigurationSync = (): vscode.Disposable => {
            return vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('polacode') || e.affectsConfiguration('editor')) {
                this.syncSettings();
            }
            });
        };
        /**
         * Handles events when the extension receives messages from the webview
         *  This extension has response for:
         * 'shoot' -> for when u press the save button, 
         * 'updateBgColor' -> update bgColor value in global state, 
         * 'invalidPasteContent' -> u can guess this,
         *  'getAndUpdateCacheAndSettings' -> # TODO, not sure yet. I think sends the color in settingd back to the webview
         */
        const setupMessageListeners = (): vscode.Disposable | undefined => {
            return this.panel?.webview.onDidReceiveMessage(({ type, data }) => {
                switch (type) {
                    case 'shoot':
                    {
                        vscode.window.showSaveDialog({
                            defaultUri: this.lastUsedImageUri,
                            filters: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                "Images": ['png']
                            }
                        })
                        .then(uri => {
                            if (uri) {
                                const bytes = new Uint8Array(data.serializedBlob.split(','));
                                fs.writeFileSync(uri.fsPath, Buffer.from(bytes));
                                this.lastUsedImageUri = uri;
                            }
                        });
                        break;
                    }

                    case 'updateBgColor':
                    {
                        this.context.globalState.update('polacode.bgColor', data.bgColor);
                        break;
                    }

                    case 'invalidPasteContent':
                        vscode.window.showInformationMessage('Pasted content is invalid. Only copy from VS Code and check if your shortcuts for copy/paste have conflicts.');
                        break;
                }
            });
        };


        // Activate events when extension is activated
        //const selectionListener = setupSelectionSync();
        const configurationListener = setupConfigurationSync();
        const messageListeners = setupMessageListeners();
        // dispose events above when panel disposed
        this.panel?.onDidDispose(() => {
           // selectionListener.dispose();
            configurationListener.dispose();
            messageListeners?.dispose();
            this.panel = undefined;
        });


    }
  
    /**
     * pushes configurations in settings into webview panel
     */
    private syncSettings() {
        const settings = vscode.workspace.getConfiguration('polacode');
        const editorSettings = vscode.workspace.getConfiguration('editor');
        this.panel?.webview.postMessage({
            type: 'updateSettings',
            target: settings.get('target'),
            transparentBackground: settings.get('transparentBackground'),
            backgroundColor: settings.get('backgroundColor'),
            shadow: settings.get('shadow'),
            ligature: editorSettings.get('fontLigatures')
        });
    }

    /**
     * 
     * @param htmlPath path to the html file
     * @returns html string for webview
     */
    private getWebviewContent() {
        const htmlPath = vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'index.html').fsPath;
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        return htmlContent.replace(/script src="([^"]*)"/g, (match, src) => {
            const onDiskPath = vscode.Uri.joinPath(this.context.extensionUri, 'resources', src);
            const realSource = this.panel?.webview.asWebviewUri(onDiskPath);
            
            return `script src="${realSource}"`;
        }).replace(/vscode-resource\:/g, () => {
            if (this.panel){return this.panel.webview.cspSource;} 
            else {return '';}
        });
    }


}

