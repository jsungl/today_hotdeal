import { Outlet, Navigate, useLocation } from "react-router-dom";
//import { useSelector } from 'react-redux';
import axios from 'axios';
import { useState } from 'react';
//import CircularProgress from "@mui/material/CircularProgress";
//import LinearProgress from '@mui/material/LinearProgress';


export default function PublicRoute({restricted}){
    //const userLogin = useSelector(state => state.userReducer.isLogined);

    // const userInfo = localStorage.getItem('userInfo');
    // const isLogined = userInfo && JSON.parse(userInfo).isLogined;
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(true);
    const { state } = useLocation();
    console.log('[PublicRoute] state :',state);

    // const isLogined = sessionStorage.getItem('ILOGIN');
    // console.log('[PublicRoute] 로그인(storage) :',isLogined);

    const initializeUser = async() => {
        try {
            console.log('[PublicRoute] 로그인검사');
            const res = await axios.get(`${process.env.REACT_APP_URL}/user/checkLogin`);
            if(res.data.isLogined) {
                setLogin(true);
            }
            setLoading(false);
        }catch(err) {
            console.log(err);
        }
    }


    if(!login) {
        loading && initializeUser();
    }
        

    if(login && restricted) {
        return <Navigate to='/'/>
    }else {
        if(!loading) {
            return <Outlet/>
        }
    }
}
