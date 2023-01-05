
/**
 * 액션 타입
 */
const SET_CONTENT = "posts/SET_CONTENT";
const SET_FLAG = "posts/SET_FLAG";
 
 /**
  * 액션 생성함수
  */
export const setContent = (content) => ({ type: SET_CONTENT, content });
export const setFlag = (flag) => ({ type: SET_FLAG, flag });
 
 /* 초기 상태 선언 */
const initialState = {
    content: "",
    flag: false
};
 
 /**
  * 리듀서 선언
  * 리듀서는 export default로 내보낸다
  */
export default function postReducer(state = initialState, action) {
    switch (action.type) {
        case SET_CONTENT:
            return {
                ...state,
                content: action.content
            };
        case SET_FLAG:
            return {
                ...state,
                flag: action.flag
            };
        default:
            return state;
    }
}
