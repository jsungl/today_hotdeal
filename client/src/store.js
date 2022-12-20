import {createStore} from 'redux';


function reducer(state, action){
    if(state === undefined){
        return {
            title: '',
            content: '',
            userId:'suver21',
            flag: false
        }
    }
    const newState = {...state};
    if(action.type === 'TITLE_CHANGE'){
        newState.title = action.title;
    } else if(action.type === 'CONTENT_CHANGE') {
        newState.content = action.content;
    } else if(action.type === 'IMAGE_INSERT') {
        newState.flag = action.flag;
    } else {
        newState.title = '';
        newState.content = '';
        newState.flag = false;
    }
    return newState;
}

const store = createStore(reducer);

export default store;