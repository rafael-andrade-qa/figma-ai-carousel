export function getAppRoot(): HTMLElement {
  const root = document.getElementById("app-root");

  if (!root) {
    throw new Error("App root (#app-root) não encontrado.");
  }

  return root;
}