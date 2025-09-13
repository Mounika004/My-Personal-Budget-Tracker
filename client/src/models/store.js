import { createStore, combineReducers } from "redux";
import { userReducer } from "./reducers/userReducer";
import { meReducer } from "../redux/reducers/meReducer";
import { uiReducer } from "../redux/reducers/uiReducer";

const root = combineReducers({
  user: userReducer,
  me: meReducer,
  ui: uiReducer,
});

export const store = createStore(root);
