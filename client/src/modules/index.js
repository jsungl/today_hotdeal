import { combineReducers } from 'redux';
import userReducer from "./users";
import postReducer from "./posts";
import asyncReqReducer from "./asyncReqState";
import { createStore } from "redux";

const rootReducer = combineReducers({
  userReducer,
  postReducer,
  asyncReqReducer
});

const store = createStore(rootReducer);

export default store;