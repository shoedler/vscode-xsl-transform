import { window, workspace, Uri, ExtensionContext} from "vscode";
import { executeXSLTransformCommand } from "./commandHandler";
import * as url from "url";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

export interface XSLTransformation 
{
  xml: string;
  xslt: string;
  processor: string;
}

/**
 * Gets the stylesheet defined in the settings (xsl.stylesheet)
 * 
 * @param context the ExtensionContext
 * @returns stylesheet URI or undefined
 */
async function getStylesheetFromConfiguration(context?: ExtensionContext | undefined)
{
  let configuration = workspace.getConfiguration("xsl");
  let stylesheetConf = configuration.get<string>("stylesheet");

  if (stylesheetConf == "")
  {
    window.showWarningMessage("No XSL stylesheet configured");
    return;
  }

  try 
  {
    await workspace.fs.stat(Uri.file(stylesheetConf!))
    //workspace.fs.stat(Uri.file(stylesheetConf!))
  } 
  catch (error) 
  {
    window.showWarningMessage(`The configured XSL stylesheet does not exist. ${stylesheetConf}`);
    return;
  }
  //console.log(`Stylesheet from config: ${stylesheetConf}`);
  return stylesheetConf;
}


/**
 * Gets the stylesheet defined in the document processing instruction
 * 
 * @returns stylesheet URI or undefined
 */
async function getStylesheetFromDocument()
{
  let xml = window.activeTextEditor!.document.getText();
  if (xml.includes('<?xml-stylesheet')){
    let regexp = new RegExp('<\\?xml-stylesheet.*?\\?>')
    let res = xml.match(regexp);
    if (res){
      let declaration = res[0]
      regexp = new RegExp('href="(.*?)"');
      res = declaration.match(regexp);
      if (res && res.length >= 2){
        let target = res[1]
        if (target.endsWith('.xsl') || target.endsWith('.xslt')){
          console.log(`declared stylesheet: ${target}`);
          return target;
        }
      }
    }
  }
}

/**
 * Determines what stylesheet to use
 * 
 * @param stylesheetConf Stylesheet from configurations
 * @param stylesheetDef stylesheet defined in document
 * @returns stylesheet URI or undefined
 */
async function determineStylesheetToUse(context: ExtensionContext, stylesheetConf:string|undefined, stylesheetDef:string|undefined) {


  if (stylesheetConf === undefined && stylesheetDef === undefined){
    window.showErrorMessage("No Stylesheet Defined: Neither in Configuration nor in the XML document");
    return
  }

  // one of the style sheets seems to be defined

  if (stylesheetDef == stylesheetConf){
    //if they are identical, just return one
    console.log("Stylesheets are identical.");
    
    return stylesheetConf;
  }

  if (stylesheetDef === undefined){
    // if only the stylesheet from the config is defined, just return that (as it has already been tested)
    console.log("Use stylesheet from configurations.");
    
    return stylesheetConf;
  }
  
  // if we make it here, we have to cache the declared stylesheet (unless it's local)
  let stylesheetDefLocal = getLocallyAccessibleCopyOfStylesheet(context, stylesheetDef);

  if (stylesheetDefLocal === undefined){
    // stylesheet from definition could not be made accessible. Fall back to stylesheet from config (which might still be undefined.)
    console.log("Stylesheet form Document processing instruction could not be made available.\nUse stylesheet from configurations, which might be undefined.");
    return stylesheetConf;
  }

  // if we make it here, stylesheetDefLocal exists and is accessible

  if (stylesheetConf === undefined) {
    console.log("Use stylesheet from document processing instructions.");
    return stylesheetDefLocal;
  }

  // if we make it here, both are defined and accessible, so the user has to decide, which one to use.
  console.log("Two stylesheets available. Let the user chose.");
  let options = ['From Stylesheet Declaration', 'From Settings']
  let choice = await window.showQuickPick(options, {
    placeHolder: "From which Stylesheet do you want to transform?"
  });
  let iChoice = options.indexOf(choice!);
  if (iChoice == -1) {
    return;
  } else if (iChoice == 0) {
    return stylesheetDefLocal;
  } else if (iChoice == 1){
    return stylesheetConf;
  }
  return;
}

function getLocallyAccessibleCopyOfStylesheet(context: ExtensionContext, target: string){
  if (target.startsWith("http") || target.startsWith("www")){
    // cache from web
    // TODO: Could there be other options, how the URL starts?

    // ensure the storage path exists
    let storage = context!.globalStoragePath;
    if (fs.existsSync(storage)){
      console.log('storage exists');
    } else {
      console.log('creating storage');
      fs.mkdirSync(storage);
      console.log('file created');
    }

    // cache stylesheet
    let tmpFile = path.join(storage, "tmp.xsl")
    fs.writeFileSync(tmpFile, '');
    console.log(`trying to cache ${target} to ${tmpFile}`);
    fetchAndSaveFile(target, tmpFile);
    console.log(tmpFile);
    return tmpFile;
    // LATER: if wanted: mark temp file as to be deleted, and delete later
  } else {
    // assume, it's a local file
    let file = undefined;
    if (path.isAbsolute(target)){
      file = target;
    } else {
      let xmlDir = path.dirname(window.activeTextEditor!.document.fileName);
      file = path.resolve(xmlDir, target);
    }

    file = path.normalize(file);
    if (fs.existsSync(file)){
      return file;
    } else {
      return undefined;
    }
  }
}

export async function runXSLTransformation(context?: ExtensionContext | undefined): Promise<void> 
{
  let configuration = workspace.getConfiguration("xsl");
  let processor = configuration.get<string>("processor");
  
  if (processor === undefined) 
  {
    window.showErrorMessage("No XSLT processor configured");
    return;
  }

  if (window.activeTextEditor === undefined)  
  {
    window.showErrorMessage("No valid XML file opened");
    return;
  }

  let stylesheetConf = await getStylesheetFromConfiguration(context);
  let stylesheetDef = await getStylesheetFromDocument();
  let stylesheetToUse = await determineStylesheetToUse(context!, stylesheetConf, stylesheetDef);

  let xml = window.activeTextEditor!.document.getText();
  if (xml === undefined || xml.length == 0){
    window.showErrorMessage("Ended up without XML Data.")
    return;
  }

  if (stylesheetToUse === undefined){
    window.showErrorMessage("Ended up without stylesheet.")
    return;
  }

  const xsltTransformation: XSLTransformation = 
  {
    xml: xml,
    xslt: stylesheetToUse,
    processor: processor
  };

  await executeXSLTransformCommand(xsltTransformation);
  //fs.unlinkSync(tmpFile); //TODO: delete tempFile if needed
}

function fetchAndSaveFile(fileURL: string, targetPath: string) {
  const timeout = 10000;
  const urlParsed = url.parse(fileURL);
  const uri = urlParsed.pathname!.split('/');
  let req = undefined;
  let filename = (uri[uri.length - 1].match(/(\w*\.?-?)+/)!)[0];

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