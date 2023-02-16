import { useState, useRef } from 'react';
import { Outlet, useSearchParams, useLocation, useNavigate, createSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from './Header';
import Footer from './Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Layout() {
    console.log('=========Layout Component Rendering=========');
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const { pathname } = useLocation();
    //const {pathname, search} = useLocation();
    //const currentPath = pathname + search; 현재 페이지 주소(쿼리스트링 포함)
    const searchText = useRef(null); //검색 TextField enter 입력시 focus out
    const queryKeyword = params.get('search_keyword') || '';
    const [target,setTarget] = useState(params.get('search_target') || 'title_content');

    const qs = {
        page: Number(params.get('page')),
        align: params.get('align'),
        keyword: params.get('search_keyword'),
        target: params.get('search_target'),
        category: Number(params.get('cat'))
    }
    console.log('[Layout] params: ',qs);
    
    //* 검색함수
    const searchKeyword = (event) => {
        event.preventDefault();
        searchText.current.blur();
        const data = new FormData(event.currentTarget);
        const srchKeyword = data.get('search-keyword');

        if(pathname === '/list') {
            // /list 페이지
            setParams({search_target:target,search_keyword:srchKeyword});
        } else {
            // 그외 모든 페이지
            navigate({
                pathname: '/list',
                search:`?${createSearchParams({
                    search_target: target,
                    search_keyword: srchKeyword
                })}`
            });
        }
    };


    return (
        <Container sx={{height: "100vh", display: "flex", flexDirection: "column"}}>
            <Header target={target} setTarget={setTarget} keyword={queryKeyword} searchKeyword={searchKeyword} searchText={searchText}/>
            <Box component="main" sx={{flex:1, mt:"50px", mb:"50px"}}>
                <Outlet context={[params,setParams]}/>
            </Box>
            <Footer />
        </Container>
    );
};
