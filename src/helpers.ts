import * as vscode from "vscode";
import * as path from "path";
import { getUserHome } from "./systemPaths";

// Helper function to resolve the log file path
export async function getLogFilePath(): Promise<string | undefined> {
  const config = vscode.workspace.getConfiguration("dailyLog");
  let filePath = config.get<string>("filePath");
  let hasWorkspace = false;

  if (!filePath) {
    vscode.window.showErrorMessage(
      'Daily Log: Log file path is not configured. Please set "dailyLog.filePath" in your settings.'
    );
    return undefined;
  }

  // Resolve ${workspaceFolder} if present
  if (
    vscode.workspace.workspaceFolders &&
    filePath.includes("${workspaceFolder}")
  ) {
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    filePath = filePath.replace("${workspaceFolder}", workspaceRoot);
    hasWorkspace = true;
  } else if (
    filePath.includes("${workspaceFolder}") &&
    !vscode.workspace.workspaceFolders
  ) {
    vscode.window.showErrorMessage(
      'Daily Log: Cannot resolve ${workspaceFolder}. Please open a workspace or set an absolute path for "dailyLog.filePath".'
    );
    return undefined;
  }

  // Resolve __USER_DOCUMENTS_DIR__ if present
  if (filePath.includes("__USER_DOCUMENTS_DIR__")) {
    const homeDir = hasWorkspace ? "" : getUserHome(); // <- your wrapper for os.homedir()
    const documentsPath = path.join(homeDir, "Documents");
    filePath = filePath.split("__USER_DOCUMENTS_DIR__").join(documentsPath);
  }

  return filePath;
}

type FormatterProp = {
  doneToday: string;
  whatsNext: string;
  worriedAbout: string;
  date?: Date;
};

// Helper function to format entry
export function entryFormatter({
  whatsNext,
  worriedAbout,
  doneToday,
  date = new Date(),
}: FormatterProp) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // For am/pm
  };

  const formattedDate = new Intl.DateTimeFormat("en-GB", dateOptions).format(
    date
  );
  const formattedTime = new Intl.DateTimeFormat("en-US", timeOptions).format(
    date
  );

  const newLogEntry = `\n# [${formattedDate}, ${formattedTime}]:
### What have I done today?
- ${doneToday.split("\n").join("\n- ")}
### What's next?
- ${whatsNext.split("\n").join("\n- ")}
### What broke or got weird?
- ${worriedAbout.split("\n").join("\n- ")}
`;

  return newLogEntry;
}
