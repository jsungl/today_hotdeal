import { useDispatch, useSelector } from 'react-redux';
import { useLayoutEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Layout from './components/Layout';
import NotFound from './components/pages/NotFound';
import BoardList from './components/pages/BoardList';
import Board from './components/pages/Board';
import BoardWrite from './components/pages/BoardWrite';
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import MemberInfo from './components/pages/MemberInfo';
import MemberOwnDocument from './components/pages/MemberOwnDocument';
import FindAccount from './components/pages/FindAccount';
import BoardUpdate from './components/pages/BoardUpdate';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import ResetPassword from './components/pages/ResetPassword';
import { setLogin, setLogout } from './modules/users';
import axios from 'axios';

export default function App() {
  const dispatch = useDispatch();
  console.log('=========App Component Rendering=========');
  const isLogined = useSelector(state => state.userReducer.isLogined);
  // console.log('[App] isLogined :',isLogined);


  // window.onbeforeunload = function() {
  //   console.log('[App] onbeforeunload ');
  // }
  
  // window.onunload = function() { 
  //   console.log('[App] onunload ');
  // }

  useLayoutEffect(() => {
    async function initializeUser() {
      try{
        const result = await axios.get(`${process.env.REACT_APP_URL}/user/checkLogin`,{withCredentials: true});
        console.log('[App] 로그인: ',result.data.isLogined);
        if(result.data.isLogined) { //로그인
          console.log('[App] 로그인한 유저 정보: ',result.data.userInfo);
          dispatch(setLogin(result.data.userInfo));
          // let isLogined = sessionStorage.getItem('ILOGIN');
          // if(!isLogined) sessionStorage.setItem('ILOGIN',true); 
        }

      }catch(err) {
        console.error(err.response.data.message);
        dispatch(setLogout());
        //sessionStorage.removeItem('ILOGIN');
      }
    }

    console.log('[App] isLogined :',isLogined);
    if(!isLogined) initializeUser();
    
  },[isLogined,dispatch]);

  
  return (
    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Home/>} />  
        <Route path='list' element={<BoardList />}/>
        <Route path='board/:postId' element={<Board />} />
        <Route element={<PrivateRoute/>}>
          <Route path='boardWrite' element={<BoardWrite/>}/>
          <Route path='boardUpdate/:postId' element={<BoardUpdate />} />
          <Route path='memberInfo' element={<MemberInfo/>}/>
          <Route path='memberInfo/:file' element={<MemberOwnDocument/>} />
        </Route>
      </Route>
      <Route element={<PublicRoute restricted={true}/>}>
        <Route path='/login' element={<Login/>} />
        <Route path='/signUp' element={<SignUp/>} />
      </Route> 
      <Route path='/findAccount' element={<FindAccount />} />
      <Route path='/resetPassword' element={<ResetPassword />} />
      <Route path='*' element={<NotFound />}/>
    </Routes>
  );
}
