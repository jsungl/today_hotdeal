
/**
 * 액션 타입
 */
const SET_POST_CONTENT = "posts/SET_CONTENT";
const SET_POST_NUMBER = "posts/SET_NUMBER";
const SET_POST_FLAG = "posts/SET_FLAG";
const SET_POST_INIT = "posts/SET_INIT";
 
 /**
  * 액션 생성함수
  */
export const setPostContent = (content) => ({ type: SET_POST_CONTENT, content });
export const setPostNumber = (postId) => ({ type: SET_POST_NUMBER, postId });
export const setPostFlag = (flag) => ({ type: SET_POST_FLAG, flag });
export const setPostInit = () => ({ type: SET_POST_INIT });
 
 /* 초기 상태 선언 */
const initialState = {
    content: "",
    postId: "",
    flag: false
};
 
 /**
  * 리듀서 선언
  * 리듀서는 export default로 내보낸다
  */
export default function postReducer(state = initialState, action) {
    switch (action.type) {
        case SET_POST_CONTENT:
            return {
                ...state,
                content: action.content
            };
        case SET_POST_NUMBER:
            return {
                ...state,
                postId: action.postId
            };
        case SET_POST_FLAG:
            return {
                ...state,
                flag: action.flag
            };
        case SET_POST_INIT:
            return {
                ...state,
                content: "",
                postId: "",
                flag: false
            };    
        default:
            return state;
    }
}
