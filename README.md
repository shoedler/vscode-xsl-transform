<h1 align="center">
  <br>
    <img src="icon.png" alt="logo" width="200">
  <br>
  XSL-Transform Extension for Visual Studio Code
  <br>
  <br>
</h1>

<p align="center">
  <a href="https://github.com/WashirePie/vscode-xsl-transform"><img src="https://img.shields.io/github/workflow/status/WashirePie/vscode-xsl-transform/Node.js%20CI.svg?logo=github" alt="vsts"></a>
</p>



## Description
Apply XSL transformations with the help of the external Saxon processor.

## Quick Start
1. Install the Extension
2. Point the `xsl.processor` setting to a valid Saxon processor in `.jar` format
3. Run `xsl.setStylesheet` and point it to your desired Stylesheet
4. Run the command `xsl.transform` in an active editor with xml content

## Extension Settings
This extension contributes the following settings:

* `xsl.processor`: Path to the Saxon XSLT Processor
* `xsl.stylsheet`: Path to the active XSL Stylesheet

## Known Issues
None

> A fork of [Svens XSLT Extension](https://marketplace.visualstudio.com/items?itemName=SvenAGN.xslt-transform)

## License
XSL transform is licensed under [MIT License](https://github.com/WashirePie/vscode-xsl-transform/blob/master/LICENSE).