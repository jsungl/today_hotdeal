import { useState, useRef, useEffect } from 'react';
import { Outlet, useSearchParams, useLocation, useNavigate, createSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from './Header';
import Footer from './Footer';
//import store from '../modules/index';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Layout() {
    console.log('=========Layout Component Rendering=========');
    const [params, setParams] = useSearchParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const searchText = useRef(null); //검색 TextField enter 입력시 focus out

    console.log('[Layout] page,align,keyword,target ::',Number(params.get('page')),params.get('align'),params.get('search_keyword'),params.get('search_target'));
    const queryTarget = params.get('search_target') || 'title_content';
    const queryKeyword = params.get('search_keyword') || '';
    const [target,setTarget] = useState(queryTarget);
    const [keyword,setKeyword] = useState(queryKeyword);

    // useEffect(() => {
    //     console.log('isLogined :',store.getState().userReducer.isLogined);
    //     console.log('userId :',store.getState().userReducer.userId);
    //     console.log('nickname :',store.getState().userReducer.userNickname);
    //     console.log('[Layout] 컴포넌트 마운트');
    // },[]);

    useEffect(() => {
        setTarget(queryTarget);
        setKeyword(queryKeyword);
        //console.log('[Layout Component] 컴포넌트 마운트');
    },[queryTarget,queryKeyword]);
    
    const searchKeyword = (event) => {
        event.preventDefault();
        searchText.current.blur();
        // console.log('[Layout Component] target ::',target);
        // console.log('[Layout Component] keyword ::',keyword);
        if(pathname === '/list') {
            // /list
            setParams({search_target:target,search_keyword:keyword});
            //console.log('[Layout Component] pathname: /list');
        } else {
            // /, /board, ....
            navigate({
                pathname: '/list',
                search:`?${createSearchParams({
                    search_target: target,
                    search_keyword: keyword
                })}`
            });
        }
        console.log('[Layout] Search Form Submit');
    };

    return (
        <Container sx={{height: "100vh", display: "flex", flexDirection: "column"}}>
            <Header target={target} keyword={keyword} setKeyword={setKeyword} setTarget={setTarget} 
                    searchKeyword={searchKeyword} searchText={searchText}/>
            <Box component="main" sx={{flex:1, mt:"50px", mb:"50px"}}>
                <Outlet context={[params,setParams]}/>
            </Box>
            <Footer />
        </Container>
    );
};
