const initial = { toasts: [] };

export function uiReducer(state = initial, action) {
  switch (action.type) {
    case "TOAST_PUSH":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "TOAST_POP":
      return { ...state, toasts: state.toasts.slice(1) };
    default:
      return state;
  }
}

export const pushToast = (text, kind = "info") => ({
  type: "TOAST_PUSH",
  toast: { id: Date.now(), text, kind },
});
export const popToast = () => ({ type: "TOAST_POP" });
