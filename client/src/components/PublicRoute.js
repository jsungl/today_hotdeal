import { Outlet, Navigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { useState } from 'react';


export default function PublicRoute({restricted}){
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(true);
    const { state } = useLocation();
    console.log('[PublicRoute] state :',state);

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
