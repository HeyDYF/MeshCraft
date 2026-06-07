export type UnsavedChangesAction =
  | "new project"
  | "open another project"
  | "import a new asset"
  | "unload the imported asset";

export function getUnsavedChangesMessage(action: UnsavedChangesAction) {
  switch (action) {
    case "new project":
      return "Discard unsaved changes and start a new MeshCraft project?";
    case "open another project":
      return "Discard unsaved changes and open another MeshCraft project?";
    case "import a new asset":
      return "Discard unsaved changes and import a new asset?";
    case "unload the imported asset":
      return "Discard unsaved changes and unload the current imported asset?";
  }
}

export function confirmUnsavedChangesAction(
  hasUnsavedChanges: boolean,
  action: UnsavedChangesAction,
  confirmFn: (message: string) => boolean = window.confirm,
) {
  if (!hasUnsavedChanges) {
    return true;
  }

  return confirmFn(getUnsavedChangesMessage(action));
}
