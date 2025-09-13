const initial = {
  loggedIn: !!localStorage.getItem("token"),
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })(),
};

export function userReducer(state = initial, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, loggedIn: true, user: action.payload.user };
    case "LOGOUT":
      return { ...state, loggedIn: false, user: null };
    default:
      return state;
  }
}
