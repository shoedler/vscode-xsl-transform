// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext } from 'vscode';
import { runXSLTransformation } from './xslt/xsltTransform';
import { setXSLStylesheet } from "./xslt/xsltSetStylesheet";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) 
{
  context.subscriptions.push(commands.registerCommand("xsl.transform", async () => 
  {
    await runXSLTransformation(context);
  }));

  context.subscriptions.push(commands.registerCommand("xsl.setStylesheet", async () =>
  {
    await setXSLStylesheet();
  }))
}

// this method is called when your extension is deactivated
export function deactivate() { }
