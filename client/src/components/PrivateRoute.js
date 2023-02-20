import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { setLogout } from '../modules/users';
import axios from 'axios';


export default function PrivateRoute() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [login, setLogin] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const { pathname } = useLocation();
    console.log('[PrivateRoute] pathname: ',pathname);

    //* 로그인 검사
    const initializeUser = async() => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_URL}/user/checkLogin`,{withCredentials: true});
            if(res.data.isLogined) {
                setLogin(true);
            }
            setLoading(false);

        }catch(err) {
            console.error(err.response.data.message);
            setLoading(false);
        }
    }

    //* 토큰 검증
    const chkAuthenticated = async() => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_URL}/user/checkUser`,{withCredentials: true});
            if(res.data.authenticated){
                console.log('[PrivateRoute] 인증성공 :',res.data.userInfo);
                setAuthenticated(true);   
            }

        }catch(err) { //토큰 만료 or 인증되지 않는 토큰 -> 로그아웃
            console.error(err.response.data.message);
            if(err.response.status === 301) {
                navigate('/',{ replace: true });
            }else if(err.response.status === 401) {
                dispatch(setLogout());
                navigate('/login?expired',{ replace: true });
            }else {
                alert('Internal Server Error');
            }
        }
    }

    if(login) {
        if(!authenticated) chkAuthenticated();
    }else {
        loading && initializeUser();
    }


    if(!loading) {
        if(!login){
            return <Navigate to='/login' state={pathname} replace={true} {...alert("로그인이 필요합니다.")}/>
        }else {
            if(authenticated) {
                return <Outlet/>
            }
        }

    }
}