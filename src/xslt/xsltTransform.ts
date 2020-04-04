import { window, workspace, Uri, ExtensionContext} from "vscode";
import { executeXSLTransformCommand } from "./commandHandler";
import * as url from "url";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";

export interface XSLTransformation 
{
  xml: string;
  xslt: string;
  processor: string;
}

export async function runXSLTransformation(context?: ExtensionContext | undefined): Promise<void> 
{
  let configuration = workspace.getConfiguration("xsl");
  let processor = configuration.get<string>("processor");
  let stylesheetConf = configuration.get<string>("stylesheet");

  let tmpFile = '';
  
  if (processor === undefined) 
  {
    window.showErrorMessage("No XSLT processor configured");
    return;
  }

  if (stylesheetConf == "")
  {
    window.showErrorMessage("No XSL stylesheet configured");
    return;
  }

  try 
  {
    await workspace.fs.stat(Uri.file(stylesheetConf!))
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
  let stylesheetToUse = '';

  if (xml.includes('<?xml-stylesheet')){
    let regexp = new RegExp('<\\?xml-stylesheet.*?\\?>')
    let res = xml.match(regexp);
    if (res){
      let declaration = res[0]
      regexp = new RegExp('href="(.*?)"');
      res = declaration.match(regexp);
      if (res && res.length >= 2){
        let target = res[1]
        console.log(target);
        if ((target.endsWith('.xsl') || target.endsWith('.xslt')) && target != stylesheetConf){
          // target points to the stylesheet
          let options = ['From Stylesheet Declaration','From Settings']
          let choice = await window.showQuickPick(options, {
            placeHolder: "From which Stylesheet do you want to transform?"
          });
          let iChoice = options.indexOf(choice!);
          if (iChoice == -1){
            return;
          } else if (iChoice == 0){
            // from Stylesheet
            let storage = context!.globalStoragePath;
            tmpFile = '' + storage + '\\tmp.xsl'
            // TODO: only works on windows, I suppose (because of backslash)
            console.log(`trying to cache ${target} to ${tmpFile}`);
            fetchAndSaveFile(target, tmpFile);
            console.log(tmpFile);
            stylesheetToUse = tmpFile;
          } else if (iChoice == 1){
            // from Settings
            stylesheetToUse = stylesheetConf!;
          } else {
            return;
          }
        }
      }
    }
  }

  const xsltTransformation: XSLTransformation = 
  {
    xml: xml,
    xslt: stylesheetToUse,
    processor: processor
  };

  await executeXSLTransformCommand(xsltTransformation);
  fs.unlinkSync(tmpFile);
}

function fetchAndSaveFile(fileURL: string, targetPath: string) {
  const timeout = 10000;
  const urlParsed = url.parse(fileURL);
  const uri = urlParsed.pathname!.split('/');
  let req = undefined;
  let filename = (uri[uri.length - 1].match(/(\w*\.?-?)+/)!)[0];

/*   if (urlParsed.protocol === null) {
    fileURL = 'http://' + fileURL;
  } */

  req = (urlParsed.protocol === 'https:') ? https : http; 

  let request = req.get(fileURL, function(response) {

    console.log(`code: ${response.statusCode}`);
    

    if (response.statusCode === 301) {
      let redirect = response.headers.location;
      console.log(`redirected to ${redirect}`);
      fetchAndSaveFile(redirect!, targetPath);
      return;
    }

    if (response.statusCode === 200) {
      try {
        console.log('reading response');
        let file = fs.createWriteStream(targetPath);
        fs.writeFileSync(targetPath, '');
        response.pipe(file);
        console.log(fs.existsSync(targetPath));
        
      } catch (error) {
        console.error(error);
        window.showErrorMessage('failed to cache file');
        return;
      }

    } else {
      window.showErrorMessage(`Downloading ${fileURL} failed. Code: ${response.statusCode}`);
    }

    request.setTimeout(timeout, function () {
      request.abort();
    })

  }).on('error', function(e) {
    window.showErrorMessage(`Downloading ${fileURL} failed! Please make sure URL is valid.`);
  });
}