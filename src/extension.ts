// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { entryFormatter, getLogFilePath } from "./helpers";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage(
    'Congratulations, "daily-log-productivity" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "dailyLog.captureEntry",
    () => {
      // Create and show a new webview panel
      const panel = vscode.window.createWebviewPanel(
        "dailyLogInput", // Identifies the type of the webview panel
        "Daily Log Entry", // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Show the editor in the first column
        {
          enableScripts: true, // Allow scripts in the webview
        }
      );

      // Get the path to the webview HTML file
      const webviewHtmlPath = vscode.Uri.joinPath(
        context.extensionUri,
        "out",
        "webview.html"
      );

      // Read the HTML content
      let htmlContent = "";
      try {
        htmlContent = fs.readFileSync(webviewHtmlPath.fsPath, "utf8");
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Daily Log: Could not load webview HTML: ${error.message}`
        );
        return;
      }

      // Set the HTML content for the webview
      panel.webview.html = htmlContent;

      // Handle messages from the webview
      panel.webview.onDidReceiveMessage(
        async (message) => {
          if (message.command === "submitEntry") {
            const { doneToday, whatsNext, worriedAbout } = message.data;

            const filePath = await getLogFilePath();

            if (!filePath) {
              return;
            }

            const logFileUri = vscode.Uri.file(filePath);

            // 2. Format the log entry
            const newLogEntry = entryFormatter({
              doneToday,
              whatsNext,
              worriedAbout,
            });

            try {
              let existingContent = "";
              // Check if file exists and read its content
              if (fs.existsSync(logFileUri.fsPath)) {
                existingContent = fs.readFileSync(logFileUri.fsPath, "utf8");
              } else {
                // Ensure directory exists if it's not the workspace root
                const dir = path.dirname(logFileUri.fsPath);
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }
              }

              // Prepend new entry to existing content
              const updatedContent = newLogEntry + existingContent;

              // Write the updated content back to the file
              fs.writeFileSync(logFileUri.fsPath, updatedContent, "utf8");

              vscode.window.showInformationMessage(
                `Daily Log: Entry saved to ${filePath}`
              );
              panel.dispose(); // Close the webview panel after saving
            } catch (error: any) {
              vscode.window.showErrorMessage(
                `Daily Log: Failed to save entry: ${error.message}`
              );
              console.error("Daily Log Error:", error);
            }
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  // Command to view daily log entries
  let viewEntriesDisposable = vscode.commands.registerCommand(
    "dailyLog.viewEntries",
    async () => {
      const filePath = await getLogFilePath();
      if (!filePath) {
        return;
      }

      const logFileUri = vscode.Uri.file(filePath);

      if (!fs.existsSync(logFileUri.fsPath)) {
        vscode.window.showInformationMessage(
          `Daily Log: No entries found yet. Log file does not exist at ${filePath}`
        );
        return;
      }

      try {
        const document = await vscode.workspace.openTextDocument(logFileUri);
        await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Daily Log: Failed to open log file: ${error.message}`
        );
        console.error("Daily Log Error:", error);
      }
    }
  );

  context.subscriptions.push(disposable, viewEntriesDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
