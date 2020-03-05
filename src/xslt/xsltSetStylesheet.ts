import { window, workspace } from "vscode";

export async function setXSLStylesheet(): Promise<void> 
{
  let configuration = workspace.getConfiguration("xsl");

  let xsltFile = await window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    filters: {
      "xslt": ["xsl", "xslt"]
    }
  });

  if (xsltFile === undefined) 
  {
    window.showErrorMessage("No valid XSLT file");
    return;
  }

  configuration.update("stylesheet", xsltFile[0].fsPath);
  window.showInformationMessage("Updated XSL Stylesheet");
}
