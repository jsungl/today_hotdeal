const SET_USER = "users/SET_USER";
const SET_LOGIN = "users/SET_LOGIN";

export const setUser = (userId) => ({ type: SET_USER, userId });
export const setLogin = (login) => ({ type: SET_LOGIN, login });

const initialState = {
  login: false,
  userId: ""
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        userId: action.userId
      };
    case SET_LOGIN:
      return {
        ...state,
        login: action.login
      };
    default:
      return state;
  }
}