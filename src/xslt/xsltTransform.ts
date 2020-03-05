import { window, workspace, Uri } from "vscode";
import { executeXSLTransformCommand } from "./commandHandler";

export interface XSLTransformation 
{
  xml: string;
  xslt: string;
  processor: string;
}

export async function runXSLTransformation(): Promise<void> 
{
  let configuration = workspace.getConfiguration("xsl");
  let processor = configuration.get<string>("processor");
  let stylesheet = configuration.get<string>("stylesheet");
  
  if (processor === undefined) 
  {
    window.showErrorMessage("No XSLT processor configured");
    return;
  }

  if (stylesheet == "")
  {
    window.showErrorMessage("No XSL stylesheet configured");
    return;
  }

  try 
  {
    await workspace.fs.stat(Uri.file(stylesheet!))
  } 
  catch (error) 
  {
    window.showErrorMessage("The configured XSL stylesheet does not exist");
    return;
  }


  if (window.activeTextEditor === undefined) 
  {
    window.showErrorMessage("No valid XML file opened");
    return;
  }

  let xml = window.activeTextEditor.document.getText();

  const xsltTransformation: XSLTransformation = 
  {
    xml: xml,
    xslt: stylesheet!,
    processor: processor
  };

  await executeXSLTransformCommand(xsltTransformation);
}