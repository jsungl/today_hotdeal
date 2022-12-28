import Upload from './Upload';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import store from '../modules/store';
import axios from 'axios';

export default function Write() {

    //const userId = store.getState().userId; //로그인한 사용자 ID, redux로 관리
    // const title = store.getState().title;
    // const content = store.getState().content;
    const dispatch = useDispatch();

    const preventClose = (e) => {
        if(store.getState().title.length !== 0 || store.getState().content.length !== 0){
            e.preventDefault();
            e.returnValue = '';
        }
    };

    const deleteFolder = (e) => {
        console.log('unload event :: ',e);
        if(store.getState().flag){
            // axios.delete(process.env.REACT_APP_DELETE_S3_OBJECTS,{data:{userId:store.getState().userId}})
            // .then(res=>console.log(res))
            // .catch(err=>console.error(err));
        }
    };


    useEffect(() => {
        console.log('컴포넌트 마운트');
        dispatch({type:'init'});
        window.addEventListener('beforeunload',preventClose);
        window.addEventListener('unload',deleteFolder);

        return async() => {
            //const post = store.getState();
            console.log('컴포넌트 언마운트');
            window.removeEventListener('beforeunload',preventClose);
            window.removeEventListener('unload',deleteFolder);
            if(store.getState().flag){    
                try {
                    const res = await axios.delete(process.env.REACT_APP_DELETE_S3_OBJECTS,{data:{userId:store.getState().userId}});
                    console.log('S3 임시폴더 삭제 :: ',res.data.deleted);
                } catch(err){
                    console.error(err);
                }
            }
        }
    },[dispatch]);

    return (
            <Upload userId={store.getState().userId}/>
    );
}