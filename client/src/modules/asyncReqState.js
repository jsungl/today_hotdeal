const ASYNC_REQ = "async/REQUEST"; // 요청 시작
const ASYNC_REQ_SUCCESS = "async/REQUEST_SUCCESS"; // 요청 성공
const ASYNC_REQ_ERROR = "async/REQUEST_ERROR"; // 요청 실패
const ASYNC_REQ_INIT = "async/INIT"; //초기화

// export const getPost = (id) => async (dispatch) => {
//   dispatch({ type: GET_POST }); // 요청이 시작됨
//   try {
//     const post = await postsAPI.getPostById(id); // API 호출
//     dispatch({ type: GET_POST_SUCCESS, post }); // 성공
//   } catch (e) {
//     dispatch({ type: GET_POST_ERROR, error: e }); // 실패
//   }
// };

export const setAsync = () => ({ type: ASYNC_REQ });
export const setAsyncSuccess = () => ({ type: ASYNC_REQ_SUCCESS });
export const setAsyncError = (error) => ({ type: ASYNC_REQ_ERROR, error });
export const setAsyncInit = () => ({ type: ASYNC_REQ_INIT });

const initialState = {
  loading: false,
  success: false,
  error: null
};

export default function asyncReqReducer(state = initialState, action) {
  switch (action.type) {
    case ASYNC_REQ:
      return {
        ...state,
        loading: true,
        success: false,
        error: null
      };
    case ASYNC_REQ_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };
    case ASYNC_REQ_ERROR:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.error
      };
    case ASYNC_REQ_INIT:
      return {
        ...state,
        loading: false,
        success: false,
        error: null
      };  
    default:
      return state;
  }
}