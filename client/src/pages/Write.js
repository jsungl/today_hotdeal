import Upload from './Upload';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import store from '../modules/store';
//import axios from 'axios';

export default function Write() {

    const userId = store.getState().userId; //로그인한 사용자 ID, redux로 관리
    console.log('Write 컴포넌트 userId :: ',userId);
    const dispatch = useDispatch();

    const preventClose = (e) => {
        if(store.getState().title.length !== 0 || store.getState().content.length !== 0){
            e.preventDefault();
            e.returnValue = '';
        }
    };

    const deleteFolder = (e) => {
        console.log('unload event',e);
        // if(store.getState().flag){
        //     await axios.delete(`${process.env.REACT_APP_URL}/uploadimg/${userId}`)
        //         .then(res => console.log(res))
        //         .catch(err => console.log(err));
        // }
    }

    useEffect(() => {
        console.log('컴포넌트 마운트');
        dispatch({type:'init'});
        window.addEventListener('beforeunload',preventClose);
        window.addEventListener('unload',deleteFolder);
           
        return async() => {
            const post = store.getState();
            console.log('컴포넌트 언마운트',post);
            window.removeEventListener('beforeunload',preventClose);
            window.removeEventListener('unload',deleteFolder);

            //console.log('임시폴더 삭제');
            // await axios.delete(`${process.env.REACT_APP_URL}/uploadimg/${userId}`)
            //     .then(res => console.log(res))
            //     .catch(err => console.log(err));
        }
    },[dispatch]);

    return (
            <Upload userId={userId}/>
    );
}