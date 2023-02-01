const SET_LOGIN = "users/SET_LOGIN";
const SET_LOGOUT = "users/SET_LOGOUT";

export const setLogin = (user) => ({ type: SET_LOGIN, userId: user.userId, userNickname: user.userNickname });
export const setLogout = () => ({ type: SET_LOGOUT });

const initialState = {
  isLogined: false,
  userId: "",
  userNickname: "",
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_LOGIN:
      return {
        ...state,
        isLogined: true,
        userId: action.userId,
        userNickname: action.userNickname,
      };
    case SET_LOGOUT:
      return {
        ...state,
        isLogined: false,
        userId: "",
        userNickname: "",
      }
    default:
      return state;
  }
}