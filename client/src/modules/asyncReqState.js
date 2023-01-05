const UPDATE_POST = "UPDATE_POST"; // 요청 시작
const UPDATE_POST_SUCCESS = "UPDATE_POST_SUCCESS"; // 요청 성공
const UPDATE_POST_ERROR = "UPDATE_POST_ERROR"; // 요청 실패

// export const getPost = (id) => async (dispatch) => {
//   dispatch({ type: GET_POST }); // 요청이 시작됨
//   try {
//     const post = await postsAPI.getPostById(id); // API 호출
//     dispatch({ type: GET_POST_SUCCESS, post }); // 성공
//   } catch (e) {
//     dispatch({ type: GET_POST_ERROR, error: e }); // 실패
//   }
// };

const initialState = {
  loading: false,
  success: false,
  error: null
};

export default function asyncReqReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_POST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null
      };
    case UPDATE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };
    case UPDATE_POST_ERROR:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.error
      };
    default:
      return state;
  }
}