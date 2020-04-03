import { workspace } from "vscode";
import { Runner } from "./xsltRunner";
import * as path from 'path';
import { XSLTransformation } from "./xsltTransform";

export async function executeXSLTransformCommand(transformation: XSLTransformation) 
{
  let cmd = `java -jar ${transformation.processor} -s:- -xsl:"${transformation.xslt}"`;
  let cwd: string | undefined;
  let commandRunner: Runner = new Runner();

  if (workspace.workspaceFolders) 
  {
    cwd = path.join(workspace.workspaceFolders[0].uri.fsPath);
  }

  commandRunner.runCommand(cmd, [], transformation.xml, cwd);
}