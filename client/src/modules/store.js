import {createStore} from 'redux';


const initialState = {
    content: '',
    userId: 'suver21',
    flag: false
};

function reducer(state = initialState, action){
    switch (action.type) {
        case "USER_CHANGE":
            return {
                ...state,
                userId: action.userId
            };
        case "CONTENT_CHANGE":
            return {
                ...state,
                content: action.content
            };
        case "IMAGE_UPLOAD":
            return {
                ...state,
                flag: action.flag
            };  
        default:
            return state;
    }
}

const store = createStore(reducer);

export default store;