# Daily Log Productivity

**Daily Log Productivity** is a simple yet powerful VS Code extension designed to help developers and anyone tracking their daily progress to quickly log their accomplishments, plan for the future, and reflect on challenges. Keep your daily notes organized, timestamped, and easily accessible right within your favorite editor.

## ✨ Features

* **Beautiful Webview Input Form:** Say goodbye to simple input boxes\! Capture your daily log entries using a sleek, integrated Webview form that feels native to VS Code.

  * **What have I done today?**
  * **What's next?**
  * **What broke or got weird?**
* **Timestamped Log Entries:** Each entry is automatically timestamped with the date and time, ensuring a clear chronological record of your work.
* **Top-First Logging:** Newer log entries are always prepended to the top of your Markdown log file, so your most recent thoughts are immediately visible.
* **Quick View Entries Command:** Easily open your `daily_log.md` file with a single command to review your past entries and kickstart your day.
* **Configurable Log File Path:** Choose where your daily log file is stored, whether it's in your current workspace or a centralized location in your user's Documents folder, regardless of your operating system.

## 🚀 How to Use

1. **Install the Extension:** Search for "Daily Log Productivity" in the VS Code Extensions view and install it.
2. **Capture a New Entry:**
   * Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
   * Type `Daily Log: Capture Entry` and select it.
   * A new Webview panel will open. Fill in the three input fields and click "Save Log Entry".
3. **View Your Entries:**
   * Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
   * Type `Daily Log: View Entries` and select it.
   * Your `daily_log.md` file will open in the editor, showing all your entries.

## ⚙️ Extension Settings

This extension contributes the following settings:

* `dailyLog.filePath`:

  * Type: `string`
  * Default: `__USER_DOCUMENTS_DIR__/dailyLog/daily_log.md`
  * Description: Specifies the full path to your Markdown log file.
    * Use `${workspaceFolder}` to refer to the root directory of your currently open workspace.
    * Use `__USER_DOCUMENTS_DIR__` to refer to the user's standard "Documents" folder (e.g., `/Users/youruser/Documents` on macOS/Linux, `C:\Users\youruser\Documents` on Windows).

  **Example Custom Paths:**

  * `"dailyLog.filePath": "${workspaceFolder}/my_dev_log.md"`
  * `"dailyLog.filePath": "/Users/yourname/personal_logs/daily_notes.md"`
  * `"dailyLog.filePath": "C:\\Users\\yourname\\Documents\\my_daily_journal.md"`

## 🐛 Known Issues

No known issues at this time. If you encounter any problems, please report them on the [GitHub repository](https://github.com/ScribbleTons/daily-logger-vscode-extension).

## 📝 Release Notes

### 0.0.1

Initial release of Daily Log Productivity.

* Capture daily log entries via an interactive Webview.
* Timestamped entries, prepended to a Markdown file.
* Configurable log file path.
* Command to view all log entries.

---

## Contributing

If you have suggestions for improvements, bug reports, or would like to contribute, please visit the [GitHub repository](https://github.com/ScribbleTons/daily-logger-vscode-extension)

**Enjoy staying productive\!**
