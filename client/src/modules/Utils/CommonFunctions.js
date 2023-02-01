import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setLogout } from '../users';


export function LogoutFunc(userId) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    axios.post(`${process.env.REACT_APP_URL}/user/logout`,{userId})
    .then(res => {
        if(res.data.isLogout){
            //스토리지 삭제
            localStorage.removeItem('userInfo');
            //redux 초기화
            dispatch(setLogout());
            navigate('/login'); //TODO: 로그아웃 후 뒤로가기 버튼을 눌렀을 때, 인증이 필요한 페이지 접속이 불가능 처리.
            //window.location.href = '/';
        }
    })
    .catch(err => {
        console.log(err);
    });
} 

export function CommonFunctions() {

}

//exports.logout = Logout