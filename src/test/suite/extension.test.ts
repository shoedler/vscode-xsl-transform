import * as assert from 'assert';
import { runXSLTransformation } from '../../xslt/xsltTransform';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => 
{
	vscode.window.showInformationMessage('Start all tests.');
	
	test('XML transformation', () =>
	{
		vscode.workspace.openTextDocument('test.xml').then(xml =>
		{			
			let configuration = vscode.workspace.getConfiguration('xsl');
			configuration.update("stylesheet", 'test.xsl');
		
			runXSLTransformation().then(res => {
				vscode.workspace.openTextDocument('result.xml').then(result =>
				{
					assert.equal(xml, result.getText());
				});
			});
		});
	}
	);
});
