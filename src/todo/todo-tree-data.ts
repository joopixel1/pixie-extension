import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';


export type Obj = {
    [key: string]: boolean
};
type Line = {
    str: string,
    no: number
};


export class TodoDataProvider implements vscode.TreeDataProvider<TodoDataItem> {

    constructor(
        private readonly config: string[],
        private readonly folder?: string,
    ){}

    // events section
    private _onDidChangeTreeData: vscode.EventEmitter<TodoDataItem | undefined | null | void> = new vscode.EventEmitter<TodoDataItem | undefined | null | void>();

    readonly onDidChangeTreeData?: vscode.Event<void | TodoDataItem | null | undefined> = this._onDidChangeTreeData.event;

    public refresh = (item?: TodoDataItem) => this._onDidChangeTreeData.fire(item);
  


  //functions section
    public getTreeItem(element: TodoDataItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: TodoDataItem): Thenable<TodoDataItem[]> | TodoDataItem[] {

        if(element)
        {
            return element.getchildren();
        } 
        else {

            if(this.folder)
            {
                return Promise.resolve(
                    new WorkSpaceDataItem("doesnt matter", this.folder, this.config, this.refresh).getchildren()
                );
            }
            else
            {
                if(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
                {
                    return Promise.resolve(
                        vscode.workspace.workspaceFolders.map((folder) => new WorkSpaceDataItem(folder.name, folder.uri.fsPath, this.config,  this.refresh))
                    );
                }
                else{
                    vscode.window.showInformationMessage('No workspace');
                    return [];
                }
            }

 
        }
    }

}


class TodoDataItem extends vscode.TreeItem {
    constructor(
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        desc: string,
        tooltip: string,
        uri?: vscode.Uri,
    ) {
        super(label, collapsibleState);
        this.description = desc;
        this.resourceUri = uri;
        this.tooltip = tooltip;
  
        if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
            this.command = {
            arguments:[this.resourceUri, parseInt(this.description.slice(3))-1],
            title: 'Open File',
            command: 'todo.open', 
            tooltip: 'Open',
            };
        }
    }


    public getchildren(): TodoDataItem[] {
        return [];
    }
}


class FileDataItem extends TodoDataItem {
    constructor( 
        filename: string,
        filepath: string,
        resourceUri: vscode.Uri,
        private readonly lines: Line[]
    ) {
        super(filename, vscode.TreeItemCollapsibleState.Collapsed, filepath, filepath, resourceUri);
    }

    
    override getchildren(): TodoDataItem[]{
        return this.lines.map(({str, no}) => new TodoDataItem(str, vscode.TreeItemCollapsibleState.None, 'ln '+no, str, this.resourceUri));
    }
}


// try async
class WorkSpaceDataItem extends TodoDataItem {
    private readonly result: FileDataItem[] = [];
    private readonly config: string[];
    private readonly base: number;


    constructor(
        filename: string,
        filepath: string,
        config: string[],    
        private readonly refresh: (item?: TodoDataItem) => void,           
    ){
        super(filename, vscode.TreeItemCollapsibleState.Collapsed, filepath, filepath);
        this.config = [...new Set([...config, ...this.findGitignores(filepath, config)])];
        this.base = filepath.lastIndexOf("\\")+1;
        if (this.description && typeof this.description === 'string'){
            this.recursiveGetFilesWithTodo(this.description);
        }
        else {
            throw new Error('Description has error');
        }
    }


    override getchildren(): FileDataItem[] { 
        return this.result;
    }


    private recursiveGetFilesWithTodo(pathDir: string)  {
        glob.glob('*.*', {cwd: pathDir, ignore: this.config, dot:true}).then((files) => {
            for (const file of files) {
                const filePat = path.join(pathDir, file);
                this.searchWordInDocument(filePat).then(
                    (lines) => {
                        if(lines.length > 0) {
                            this.result.push(new FileDataItem(file, filePat.slice(this.base), vscode.Uri.file(filePat), lines));
                            this.refresh(this);
                        }
                    }, 
                    (err) => {}
                );
            }
        });

        glob.glob('*/', {cwd: pathDir, ignore: this.config, dot:true}).then((dirs) => {
            for (const dir of dirs) {
                this.recursiveGetFilesWithTodo(path.join(pathDir, dir));
            }
        });
    }
   
    //KPM algorithm
    private async searchWordInDocument(pathFile: string): Promise<Line[]> {
        const ans: Line[] = [];
        const file = fs.readFileSync(pathFile, 'utf-8');
        const document = file.split('\n').map((i) => i.trim());
        const pattern = /(\/\/|\#|\/\*\*)\s*(TODO)/ig;
        for (let i = 0; i < document.length; i++) {
            if (pattern.exec(document[i])) {
                ans.push({str: document[i], no: i+1});
            }
        }
        return ans;
    }
    
    private findGitignores = (pathDir:string, config: string[]): string[] => {
        const ans: string[] = [];
        const files = glob.sync('**/.gitignore', {cwd: pathDir, ignore: config, dot:true});
        for (const file of files) {
            const filepath = path.join(pathDir, file);

            try{
                const file = fs.readFileSync(filepath, 'utf-8');
                const document = file.split('\n').filter((i) => i.length > 0 && !i.startsWith('#'));
                const patterns = document.map((i) => path.posix.join('**/', i));
                ans.push(...patterns);            
            }
            catch(err) {}
        }
        return ans;
    };

}


// old sync way
// class WorkSpaceDataItem extends TodoDataItem {
//     private readonly result: FileDataItem[] = [];
//     private readonly config: string[];
//     private readonly base: number;


//     constructor(
//         filename: string,
//         filepath: string,
//         config: string[],    
//         refresh: (item?: TodoDataItem) => void,           
//     ){
//         super(filename, vscode.TreeItemCollapsibleState.Collapsed, filepath, filepath);
//         this.config = [...new Set([...config, ...this.findGitignores(filepath, config)])];
//         this.base = filepath.lastIndexOf("\\")+1;
//     }


//     override getchildren(): FileDataItem[] { 
//         if (this.description && typeof this.description === 'string'){
//             this.recursiveGetFilesWithTodo(this.description);
//         }
//         else {
//             throw new Error('Description has error');
//         }
//         return this.result;
//     }


//     private recursiveGetFilesWithTodo(pathDir: string)  {
//         const posix = pathDir.replace(/\\/g, '/');
//         const files = glob.sync('*.*', {cwd: pathDir, ignore: this.config, dot:true});
//         for (const file of files) {
//             try{
//                 const filePat = path.join(pathDir, file);
//                 const lines = this.searchWordInDocument(filePat);
//                 if(lines.length > 0) {
//                     this.result.push(new FileDataItem(file, filePat.slice(this.base), vscode.Uri.file(filePat), lines));
//                 }
//             }
//             catch(err) {}
//         }

//         const dirs = glob.sync('*/', {cwd: pathDir, ignore: this.config, dot:true});
//         for (const dir of dirs) {
//             this.recursiveGetFilesWithTodo(path.join(pathDir, dir));
//         }
//     }
//     //KPM algorithm
//     private searchWordInDocument(pathFile: string): Line[] {
//         const ans: Line[] = [];
//         const file = fs.readFileSync(pathFile, 'utf-8');
//         const document = file.split('\n').map((i) => i.trim());
//         const pattern = /(\/\/|\#|\/\*\*)\s*(TODO)/ig;
//         for (let i = 0; i < document.length; i++) {
//             if (pattern.exec(document[i])) {
//                 ans.push({str: document[i], no: i+1});
//             }
//         }
//         return ans;
//     }
    
//     private findGitignores = (pathDir:string, config: string[]): string[] => {
//         const ans: string[] = [];
//         const files = glob.sync('**/.gitignore', {cwd: pathDir, ignore: config, dot:true});
//         for (const file of files) {
//             const filepath = path.join(pathDir, file);

//             try{
//                 const file = fs.readFileSync(filepath, 'utf-8');
//                 const document = file.split('\n').filter((i) => i.length > 0 && !i.startsWith('#'));
//                 const patterns = document.map((i) => path.posix.join('**/', i));
//                 ans.push(...patterns);            
//             }
//             catch(err) {}
//         }
//         return ans;
//     };

// }

    

