import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { setLogout } from '../modules/users';
import axios from 'axios';
//import LinearProgress from '@mui/material/LinearProgress';

export default function PrivateRoute() {
    const navigate = useNavigate();
    const [login, setLogin] = useState(false);
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    console.log('[PrivateRoute] pathname: ',pathname);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    //const isLogined = useSelector(state => state.userReducer.isLogined);

    // const userInfo = localStorage.getItem('userInfo');
    // const isLogined = userInfo && JSON.parse(userInfo).isLogined;
    
    // const isLogined = sessionStorage.getItem('ILOGIN');
    // console.log('[PrivateRoute] 로그인 :',isLogined);

    const initializeUser = async() => {
        try {
            console.log('[PrivateRoute] 로그인검사');
            const res = await axios.get(`${process.env.REACT_APP_URL}/user/checkLogin`);
            if(res.data.isLogined) {
                setLogin(true);
            }
            setLoading(false);
        }catch(err) {
            console.log('[PrivateRoute] 로그인검사 에러',err);
        }
    }

    const chkAuthenticated = async() => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_URL}/user/checkUser`);
            if(res.data.authenticated){
                console.log('[PrivateRoute] 인증성공 :',res.data.userInfo);
                setAuthenticated(true);   
            }

        }catch(err) { //토큰 만료 or 인증되지 않는 토큰 -> 로그아웃
            console.log('[PrivateRoute] 인증실패 :',err);
            if(err.response.status === 301) {
                navigate('/',{ replace: true });
            }else {
                console.log(err.response.data.message);
                dispatch(setLogout());
                navigate('/login?expired');
            }
        }
    }

    if(login) {
        if(!authenticated) chkAuthenticated(); //access token 검사
    }else {
        loading && initializeUser();
    }


    // useLayoutEffect(() => {

    //     async function initializeUser() {
    //         try {
    //             const res = await axios.get(`${process.env.REACT_APP_URL}/user/checkLogin`);
    //             if(res.data.isLogined) {
    //                 setLogin(true);
    //             }
    //             setLoading(false);
    //         }catch(err) {
    //             console.log(err);
    //         }
    //     }


    //     async function chkAuthenticated() {
    //         try {
    //             const res = await axios.get(`${process.env.REACT_APP_URL}/user/checkUser`);
    //             if(res.data.authenticated){
    //                 console.log('[PrivateRoute] 인증성공 :',res.data.userInfo);
    //                 setAuthenticated(true);
                    
    //             }else {
    //                 console.log('[PrivateRoute] 인증실패');
    //             }

    //         }catch(err) { //토큰 만료 or 인증되지 않는 토큰 -> 로그아웃
    //             console.log('[PrivateRoute] 인증에러 :',err);
    //             localStorage.removeItem('userInfo');
    //             dispatch(setLogout());
    //             navigate('/login?expired');
    //         }
    //     }

    //     if(login) {
    //         chkAuthenticated(); //access token 검사
    //     }else {
    //         initializeUser();
    //     }


    // },[login,dispatch,navigate]);

    if(!loading) {
        if(!login){
            return <Navigate to='/login' state={pathname} {...alert("로그인이 필요합니다.")}/>
        }else {
            if(authenticated) {
                // if(pathname.includes('/modify/')) return <Navigate to='/memberInfo'/>
                return <Outlet/>
            }
        }

    }
}