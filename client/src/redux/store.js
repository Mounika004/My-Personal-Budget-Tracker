import { createStore, combineReducers } from "redux";
import { userReducer } from "./reducers/userReducer";
import { meReducer } from "./reducers/meReducer";
import { uiReducer } from "./reducers/uiReducer";

const root = combineReducers({
  user: userReducer,
  me: meReducer,
  ui: uiReducer,
});

export const store = createStore(root);
