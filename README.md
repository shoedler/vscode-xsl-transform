<img src="https://github.com/WashirePie/vscode-xsl-transform/blob/main/icon.png?raw=true" alt="icon" width="200">

# XSL Transformation Extension for Visual Studio Code

## Description

Apply XSL transformations with the help of the external Saxon XSLT processor.

Supports both a configurable stylesheet association (stored as `xsl.stylesheet`) and stylesheet declaration in the XML processing instruction (as `<?xml-stylesheet ...?>`).

## Prerequisities

* A [Java](https://www.java.com/de/download/) installation. *Restart your Device after installation*  
(Ensure Java is set in PATH by typing `java -version` in your console.)
* The [Saxon XSL Processor](http://saxon.sourceforge.net/#F10HE) in the form of a jar.

## Quick Start

1. Install the Extension
2. Point the `xsl.processor` setting to a valid Saxon processor in `.jar` format
3. Run `xsl.setStylesheet` and point it to your desired Stylesheet
4. Run the command `xsl.transform` in an active editor with xml content (via command palette or by hitting `Ctrl + Alt + T`)

## Extension Settings

This extension contributes the following settings:

* `xsl.processor`: Path to the Saxon XSLT Processor
* `xsl.stylsheet`: Path to the active XSL Stylesheet

## Known Issues

* Cached stylesheets do not get deleted.
* Commented out processing instructions (`<!-- <?xml-stylesheet ...?> -->`) get processed anyways.

## Road Map

Some ideas on potential future features:

* Setting to reuse cached stylesheet for some time?
* ~~Keyboard shortcut for transformation~~
* Auto recognize transformation output file type (html, xml, txt)
* Setting for what to do with transformation output
  * open in editor
  * save on disk (needs settings: where and under what name it should save; handle overwriting file; auto prompt "save as" dialog; etc.)
  * open in web browser/standard associated application
* bundle Saxon-HE so users only have to worry about it, if they need other, non-HE versions of Saxon. (If possible?)
* Introduce concept of "transformation scenario" that can be stored and associated with any XML file

## License

XSL transform is licensed under [MIT License](https://github.com/WashirePie/vscode-xsl-transform/blob/main/LICENSE).

> A fork of [Svens XSLT Extension](https://marketplace.visualstudio.com/items?itemName=SvenAGN.xslt-transform)
