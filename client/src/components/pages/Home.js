import {useEffect, useState} from 'react';
//import { useNavigate, useSearchParams, createSearchParams, useOutletContext } from 'react-router-dom';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../Pagination';
import Table from '../BoardListTable';
import BoardListHeader from '../BoardListHeader';
import BoardListFooter from '../BoardListFooter';
//import SearchBar from '../SearchBar';


export default function Home() {
    console.log('=========Home Component Rendering=========');
    const [params] = useOutletContext();
    const [post,setPost] = useState([]);
    const [totalCount,setTotalCount] = useState(0);
    // const [params] = useSearchParams();
    // const queryTarget = params.get('search_target') === null ? 'title_content' : params.get('search_target');
    // const queryKeyword = params.get('search_keyword') === null ? '' : params.get('search_keyword');
    const align = params.get('align') || 'board_no';
    const category = params.get('cat') || -1;
    const currentPage = params.get('page') === null ? 1 : params.get('page');
    // const [keyword,setKeyword] = useState(queryKeyword);
    // const [target,setTarget] = useState(queryTarget);
    const postPerPage = 10; //페이지당 보여줄 데이터 개수
    
    const navigate = useNavigate();

    //처음 컴포넌트가 마운트될 때 한번 호출
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`${process.env.REACT_APP_URL}/post/getHomeList`);
                if(res.data.result) {
                    setTotalCount(res.data.totalCount);
                    const posts = await res.data.list.map(rowData => (
                        {
                            no: rowData.board_no,
                            title: rowData.product_name,
                            nickname: rowData.user_nickname, 
                            date: rowData.enroll_date.substring(0,10), 
                            hits: rowData.hits, 
                            up: rowData.up
                        }
                    ));
                    setPost(posts);
                }
                console.log('[Home] 컴포넌트 마운트');

            } catch(err){
                console.error(err.response.data.message);
            }
        }
        fetchData();
    },[]);

    //정렬 select 선택시 호출
    const onChangeAlign = (align) => {
        navigate({
            pathname: '/list',
            search: `align=${align}`,
        });
    };

    // 카테고리 select 선택
    const onChangeCategory = (category) => {
        navigate({
            pathname: '/list',
            search: `cat=${category}`,
        });
    };

    //검색 필드(textfield) 값 변경될 때마다 호출
    // const onChangeInput = (event) => {
    //     setKeyword(event.target.value);
    // };

    //검색 select 선택시 호출
    // const onChangeTarget = (event) => {
    //     setTarget(event.target.value);
    // };
    
    //페이지 변경시 호출
    const onChangePage = (nextPage) => {
        navigate({
            pathname: '/list',
            search: `page=${nextPage}`,
        });
        //console.log('[Home Component] Page Change!');
    };

    //홈 버튼 클릭시 호출(햄버거 메뉴 버튼에서 홈 선택시에도 호출)
    const onClickHome = () => {
        window.location.reload(); //새로고침
    };
    
    //검색 form 전송시 호출
    // const searchKeyword = (event) => {
    //     event.preventDefault();
    //     searchText.current.blur();
    //     navigate({
    //         pathname: '/list',
    //         search:`?${createSearchParams({
    //             search_target: target,
    //             search_keyword: keyword
    //         })}`
    //     });
    //     console.log('-------------Search Form Submit------------');
    // };

    return (
            <>
                <BoardListHeader onClickHome={onClickHome} onChangeCategory={onChangeCategory} category={category}/>

                <Table post={post}/>

                <BoardListFooter onChangeAlign={onChangeAlign} align={align}/>
                
                <Pagination page={currentPage} totalCount={totalCount} postPerPage={postPerPage} onChangePage={onChangePage}/>
            </>
    );
}