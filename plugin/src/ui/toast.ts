type ToastVariant = "success" | "error" | "info";

type ShowToastParams = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

let hideTimeout: number | null = null;

function ensureToastRoot() {
  let root = document.getElementById("toast-root");

  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    root.className = "toast-root";
    document.body.appendChild(root);
  }

  return root;
}

function getToastIcon(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return "✓";
    case "error":
      return "!";
    case "info":
    default:
      return "i";
  }
}

export function showToast({
  title,
  message,
  variant = "info",
  durationMs = 3200,
}: ShowToastParams) {
  const root = ensureToastRoot();

  if (hideTimeout) {
    window.clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  root.innerHTML = `
    <div class="toast toast-${variant} toast-visible" role="status" aria-live="polite">
      <div class="toast-icon">${getToastIcon(variant)}</div>

      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ""}
        <div class="toast-message">${message}</div>
      </div>

      <button class="toast-close" type="button" aria-label="Fechar">×</button>
    </div>
  `;

  const closeButton = root.querySelector(".toast-close");
  closeButton?.addEventListener("click", () => {
    hideToast();
  });

  hideTimeout = window.setTimeout(() => {
    hideToast();
  }, durationMs);
}

export function hideToast() {
  const root = document.getElementById("toast-root");

  if (!root) {
    return;
  }

  const toast = root.querySelector(".toast");

  if (!toast) {
    root.innerHTML = "";
    return;
  }

  toast.classList.remove("toast-visible");
  toast.classList.add("toast-hiding");

  window.setTimeout(() => {
    root.innerHTML = "";
  }, 180);
}