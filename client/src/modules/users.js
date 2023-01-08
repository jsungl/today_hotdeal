const SET_LOGIN = "users/SET_LOGIN";
const SET_LOGOUT = "users/SET_LOGOUT";

export const setLogin = (userId) => ({ type: SET_LOGIN, userId });
export const setLogout = (userId) => ({ type: SET_LOGOUT, userId });

const initialState = {
  login: false,
  userId: "suver21"
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_LOGIN:
      return {
        ...state,
        login: true,
        userId: action.userId
      };
    case SET_LOGOUT:
      return {
        ...state,
        login: false,
        userId: ""
      }
    default:
      return state;
  }
}