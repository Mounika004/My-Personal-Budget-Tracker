const initial = {
  loading: false,
  error: null,
  me: null,
  expenses: [],
  friends: [],
  categories: [],
};

export function meReducer(state = initial, action) {
  switch (action.type) {
    case "ME_LOADING":
      return { ...state, loading: true, error: null };
    case "ME_ERROR":
      return { ...state, loading: false, error: action.error };
    case "ME_SET":
      return {
        ...state,
        loading: false,
        error: null,
        me: { email: action.payload.email, username: action.payload.username },
        expenses: action.payload.expenses || [],
        friends: action.payload.friends || [],
      };
    case "ME_SET_EXPENSES":
      return { ...state, expenses: action.payload };
    case "ME_SET_CATEGORIES":
      return { ...state, categories: action.payload };
    default:
      return state;
  }
}
