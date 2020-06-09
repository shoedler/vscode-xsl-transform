import { window, workspace, ConfigurationTarget } from "vscode";

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

  let stylesheetPath = xsltFile[0].fsPath;

  console.log('Entered: '+stylesheetPath);

  configuration.update("stylesheet", stylesheetPath, ConfigurationTarget.Global);
  window.showInformationMessage("Updated XSL Stylesheet: " + configuration.get("stylesheet"));
}
