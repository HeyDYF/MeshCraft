import { describe, expect, it, vi } from "vitest";
import {
  confirmUnsavedChangesAction,
  getUnsavedChangesMessage,
} from "./unsaved-changes";

describe("getUnsavedChangesMessage", () => {
  it("formats action-specific confirmation text", () => {
    expect(getUnsavedChangesMessage("new project")).toBe(
      "Discard unsaved changes and start a new MeshCraft project?",
    );
    expect(getUnsavedChangesMessage("open another project")).toBe(
      "Discard unsaved changes and open another MeshCraft project?",
    );
    expect(getUnsavedChangesMessage("import a new asset")).toBe(
      "Discard unsaved changes and import a new asset?",
    );
  });
});

describe("confirmUnsavedChangesAction", () => {
  it("skips confirmation when the project is already clean", () => {
    const confirm = vi.fn();

    expect(confirmUnsavedChangesAction(false, "open another project", confirm)).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("uses the confirmation callback when unsaved changes exist", () => {
    const confirm = vi.fn(() => false);

    expect(confirmUnsavedChangesAction(true, "import a new asset", confirm)).toBe(false);
    expect(confirm).toHaveBeenCalledWith(
      "Discard unsaved changes and import a new asset?",
    );
  });
});
