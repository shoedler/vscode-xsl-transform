import { ChildProcess, spawn } from "child_process";
import { ViewColumn, window, workspace } from "vscode";
import { xsltOutputChannel } from "./xsltOutputChannel";

export class Runner 
{
  private _process: ChildProcess | undefined;
  private _chunks: Array<Buffer> = [];

  public runCommand(command: string, args: string[], data: string, cwd?: string) 
  {
    xsltOutputChannel.clear();
    xsltOutputChannel.show();

    this._process = spawn(command, args, { cwd: cwd, shell: true });
    this._process.stdin.end(data, () =>       { xsltOutputChannel.append("File contents written to stdin"); xsltOutputChannel.hide();});
    this._process.stdout.on('data', (data) => { this._chunks.push(data); });
    this._process.stderr.on('data', (data) => { xsltOutputChannel.append(data.toString()); });

    this._process.on("exit", async (code) => 
    {
      if (code === 0) {
        window.showInformationMessage("XSL Transformation successful");
        try 
        {
          const xmlDocument = await workspace.openTextDocument({
            content: Buffer.concat(this._chunks).toString(),
            language: "xml"
            // TODO: make this a setting, what the output should be
            // LATER: see what the stylesheet says, what the output should be
          });
          window.showTextDocument(xmlDocument, ViewColumn.Beside);
          // TODO: other things to do with output, like save as; show in explorer/browser, etc.
        }
        catch (e) 
        {
          window.showErrorMessage("Failed to show output in a new document");
          console.error(e);
        }
      }
      else if (code === 1) 
      {
        window.showErrorMessage("XSL Transformation failed");
        window.showInformationMessage("Ensure java is installed and added to environment variables.\n(in the terminal, `java --version` should return something)")
        window.showInformationMessage("Ensure saxon is available.\n(check configuration)")
      }
    });
  }
}
