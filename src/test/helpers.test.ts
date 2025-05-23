// src/test/suite/helpers.test.ts
import * as assert from "assert";
import * as vscode from "vscode"; // Required for integration tests
import * as path from "path";
import * as sinon from "sinon";
import { getLogFilePath, entryFormatter } from "../helpers"; // Import the functions to test
import * as systemPaths from "../systemPaths";

suite("Helper Functions Unit/Integration Tests", () => {
  // --- Tests for entryFormatter (Pure Unit Tests) ---
  suite("entryFormatter", () => {
    // A fixed date for consistent timestamp testing
    // Note: Timezone can affect the output. This date is UTC.
    // The formatter uses 'en-GB' and 'en-US' which will apply local timezone.
    // Adjust expected output based on your test runner's timezone (e.g., WAT GMT+1)
    const testDate = new Date("2023-05-23T15:22:20.000Z"); // May 23, 2023, 3:22:20 PM UTC

    test("should format a basic log entry correctly", () => {
      const done = "Task A completed.";
      const next = "Start Task B.";
      const worried = "None.";

      // Expected output for GMT+1 (WAT)
      const expected = `\n# [Tuesday, 23/05/2023, 04:22:20 PM]:
### What have I done today?
- Task A completed.
### What's next?
- Start Task B.
### What broke or got weird?
- None.
`;
      const actual = entryFormatter({
        doneToday: done,
        whatsNext: next,
        worriedAbout: worried,
        date: testDate,
      });
      assert.strictEqual(
        actual.trim(),
        expected.trim(),
        "Basic entry should match expected format"
      );
    });

    test("should handle multi-line inputs with proper bullet points", () => {
      const done = "Task A completed.\nFixed bug Z.";
      const next = "Start Task B.\nReview code.";
      const worried = "Stuck on API integration.\nDependency conflict.";

      const expected = `\n# [Tuesday, 23/05/2023, 04:22:20 PM]:
### What have I done today?
- Task A completed.
- Fixed bug Z.
### What's next?
- Start Task B.
- Review code.
### What broke or got weird?
- Stuck on API integration.
- Dependency conflict.
`;
      const actual = entryFormatter({
        doneToday: done,
        whatsNext: next,
        worriedAbout: worried,
        date: testDate,
      });
      assert.strictEqual(
        actual.trim(),
        expected.trim(),
        "Multi-line entry should have correct bullet points"
      );
    });

    test("should handle empty inputs gracefully", () => {
      const done = "";
      const next = "";
      const worried = "";

      const expected = `\n# [Tuesday, 23/05/2023, 04:22:20 PM]:
### What have I done today?
- 
### What's next?
- 
### What broke or got weird?
- 
`;
      const actual = entryFormatter({
        doneToday: done,
        whatsNext: next,
        worriedAbout: worried,
        date: testDate,
      });
      assert.strictEqual(
        actual.trim(),
        expected.trim(),
        "Empty inputs should be handled without extra formatting"
      );
    });
  });

  // --- Tests for getLogFilePath (Integration Tests using Sinon Mocks) ---
  suite("getLogFilePath", () => {
    let getConfigurationStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
    let homedirStub: sinon.SinonStub;
    let joinStub: sinon.SinonStub;

    setup(() => {
      getConfigurationStub = sinon.stub(vscode.workspace, "getConfiguration");
      showErrorMessageStub = sinon.stub(vscode.window, "showErrorMessage");
      joinStub = sinon.stub().returns(() => null);

      homedirStub = sinon
        .stub(systemPaths, "getUserHome")
        .returns("/mock/home");

      showErrorMessageStub.returns(Promise.resolve(undefined));

      joinStub.callsFake(path.posix.join);

      // Set default workspaceFolders to null (no workspace)
      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        get: () => null,
        configurable: true,
      });
    });

    teardown(() => {
      sinon.restore();
    });

    test("should return undefined if filePath is not configured", async () => {
      getConfigurationStub.returns({ get: () => undefined });
      const result = await getLogFilePath();
      assert.strictEqual(result, undefined);
      assert.ok(showErrorMessageStub.calledOnce);
    });

    test("should resolve __USER_DOCUMENTS_DIR__ correctly", async () => {
      getConfigurationStub.returns({
        get: () => "__USER_DOCUMENTS_DIR__/dailyLog/log.md",
      });
      const result = await getLogFilePath();
      assert.strictEqual(result, "/mock/home/Documents/dailyLog/log.md");
    });

    test("should resolve ${workspaceFolder} correctly when workspace is open", async () => {
      getConfigurationStub.returns({
        get: () => "${workspaceFolder}/projectLog.md",
      });

      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        get: () => [
          {
            uri: vscode.Uri.file("/mock/workspace/myProject"),
            name: "myProject",
            index: 0,
          },
        ],
      });

      const result = await getLogFilePath();
      assert.strictEqual(result, "/mock/workspace/myProject/projectLog.md");
    });

    test("should return undefined and show error if ${workspaceFolder} is used without workspace", async () => {
      getConfigurationStub.returns({
        get: () => "${workspaceFolder}/projectLog.md",
      });

      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        get: () => null,
      });

      const result = await getLogFilePath();
      assert.strictEqual(result, undefined);
      assert.ok(showErrorMessageStub.calledOnce);
    });

    test("should return absolute path as is", async () => {
      getConfigurationStub.returns({ get: () => "/some/absolute/path/log.md" });
      const result = await getLogFilePath();
      assert.strictEqual(result, "/some/absolute/path/log.md");
    });

    test("should prioritize workspaceFolder over __USER_DOCUMENTS_DIR__", async () => {
      getConfigurationStub.returns({
        get: () => "${workspaceFolder}/__USER_DOCUMENTS_DIR__/nested/log.md",
      });

      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        get: () => [
          {
            uri: vscode.Uri.file("/mock/workspace/myProject"),
            name: "myProject",
            index: 0,
          },
        ],
      });

      const result = await getLogFilePath();
      assert.strictEqual(
        result,
        "/mock/workspace/myProject/Documents/nested/log.md"
      );
    });

    test("should handle __USER_DOCUMENTS_DIR__ with no workspace", async () => {
      getConfigurationStub.returns({
        get: () => "__USER_DOCUMENTS_DIR__/myLogs/daily.md",
      });

      Object.defineProperty(vscode.workspace, "workspaceFolders", {
        get: () => null,
      });

      const result = await getLogFilePath();
      assert.strictEqual(result, "/mock/home/Documents/myLogs/daily.md");
    });
  });
});
