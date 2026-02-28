export const APP_TOAST_EVENT = "app:toast"

export type AppToastVariant = "success" | "import" | "error"

export interface AppToastPayload {
  title: string
  message: string
  variant?: AppToastVariant
}

export function showToast(payload: AppToastPayload) {
  window.dispatchEvent(new CustomEvent<AppToastPayload>(APP_TOAST_EVENT, { detail: payload }))
}
