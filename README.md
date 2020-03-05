<img src="https://github.com/WashirePie/vscode-xsl-transform/blob/master/icon.png?raw=true" alt="icon" width="200">

# XSL Transformation Extension for Visual Studio Code

<p align="left">
  <a href="https://github.com/WashirePie/vscode-xsl-transform"><img src="https://img.shields.io/github/workflow/status/WashirePie/vscode-xsl-transform/Node.js%20CI.svg?logo=github" alt="vsts"></a>
</p>

## Description

Apply XSL transformations with the help of the external Saxon XSLT processor.

## Prerequisities

* A [Java](https://www.java.com/de/download/) installation. *Restart your Device after installation*
* The [Saxon XSL Processor](http://saxon.sourceforge.net/#F9.9HE) in the form of a jre.

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

## License

XSL transform is licensed under [MIT License](https://github.com/WashirePie/vscode-xsl-transform/blob/master/LICENSE).

> A fork of [Svens XSLT Extension](https://marketplace.visualstudio.com/items?itemName=SvenAGN.xslt-transform)