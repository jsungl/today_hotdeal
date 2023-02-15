import {useEffect, useState} from 'react';
//import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../BoardListTable';
import BoardListHeader from '../BoardListHeader';
import BoardListFooter from '../BoardListFooter';
import Pagination from '../Pagination';

export default function BoardList() {
    console.log('=========BoardList Component Rendering=========');
    const navigate = useNavigate();
    const [params,setParams] = useOutletContext();
    //const {pathname, search} = useLocation();
    //const currentPath = pathname + search; 현재 페이지 주소(쿼리스트링 포함)
    const page = Number(params.get('page'));
    const align = params.get('align') || 'board_no';
    const category = params.get('cat') || -1;
    const queryKeyword = params.get('search_keyword');
    const queryTarget = params.get('search_target');
    const [post,setPost] = useState([]); //데이터 목록
    const [totalCount,setTotalCount] = useState(0); //보여줄 데이터 개수
    // const [keyword,setKeyword] = useState(queryKeyword || ''); //검색어
    // const [target,setTarget] = useState(queryTarget || 'title_content'); //검색 방법(기본값 제목+내용)
    //const [align, setAlign] = useState('board_no'); //정렬방법(기본값 최신순)
    //const [currentPage, setCurrentPage] = useState(Number(pageNum)); //현재 페이지
    const postPerPage = 10; //페이지당 보여줄 데이터 개수
    
    
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`${process.env.REACT_APP_URL}/post/getBoardList`,{
                    params:{
                        'align': params.get('align') || 'board_no',
                        'offset': ((Number(params.get('page')) || 1)-1)*postPerPage,
                        'limit': postPerPage,
                        'keyword': params.get('search_keyword') ? params.get('search_keyword').toLowerCase().replace(' ', '') : '',
                        'target': params.get('search_target') || 'title_content',
                        'category': params.get('cat') || -1
                    }
                });
                res.data.length === 0 ? setTotalCount(1) : setTotalCount(res.data[0].count);
                //res.data.length === 0 ? setTotalCount(1) : setTotalCount(res.data.length);
                const posts = await res.data.map(rowData => (
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
                console.log('[BoardList] 컴포넌트 마운트');
            } catch(e){
                console.error(e.message);
            }
        }
        fetchData();
    },[params]);

    //정렬 select 선택시 호출되는 함수
    const onChangeAlign = (selectedAlign) => { 
        /*
        if(queryKeyword && queryTarget){
            //queryString에 keyword나 target이 있는경우
            setParams({
                search_target:queryTarget,
                search_keyword:queryKeyword,
                align:selectedAlign,
                page:1
            })
        } else {
            //queryString에 keyword나 target이 없는경우
            if(align && !page) {
                // align만 있는경우
                // &&연산시 뒤에 !(조건)을 둔다. 둘다 true일때 뒤 조건이 반환되므로 true가 반환되서 조건문을 실행할 수 있다.
                setParams({align:selectedAlign});
            }else {
                // page만 있거나 align,page 둘다 있는경우
                setParams({align:selectedAlign,page:1});
            }
        }
        */

        if(align) {
            params.set('align',selectedAlign);
        }else {
            params.append('align',selectedAlign);
        }

        setParams(params);
    }

    // 카테고리 select 선택
    const onChangeCategory = (category) => {
        if(category) {
            params.set('cat',category);
        }else {
            params.append('cat',category);
        }
        setParams(params);
    };

    //검색 필드(textfield) 값 변경될 때마다 호출
    // const onChangeInput = useCallback((event) => {
    //     setKeyword(event.target.value);
    // },[]);

    //검색 select 선택시 호출되는 함수
    // const onChangeTarget = useCallback((event) => {
    //     setTarget(event.target.value);
    // },[]);
    
    //페이지 변경시 호출되는 함수
    const onChangePage = (nextPage) => {
        /*
        if(queryKeyword && queryTarget){
            //queryString에 keyword나 target이 있는경우
            if(align) {
                setParams({
                    search_target:queryTarget,
                    search_keyword:queryKeyword,
                    align,
                    page:nextPage
                });
            }else {
                setParams({
                    search_target:queryTarget,
                    search_keyword:queryKeyword,
                    page:nextPage
                });
            }
            
        } else {
            if(align) {
                setParams({align, page:nextPage});
            }else {
                setParams({page:nextPage});
            }
        }
        */
        
        // ex) /list?align=board_no&page=2 
        // navigate({
        //     pathname:'/list',
        //     search:`?${createSearchParams({
        //         align:align,
        //         page:nextPage
        //     })}`
        // });

        if(page) {
            params.set('page',nextPage);
        }else {
            params.append('page',nextPage);
        }

        setParams(params);

    };

    //홈 버튼 클릭시 호출
    const onClickHome = () => {
        navigate('/');
        //window.location.href = '/';
    };
    
    let BoardListInfo = {
        post,
        totalCount,
        align,
        category,
        queryKeyword,
        queryTarget,
        page
    };
    console.log('[BoardList] BoardListInfo: ',BoardListInfo);

    return (
            <>
                <BoardListHeader onClickHome={onClickHome} onChangeCategory={onChangeCategory} category={category}/>

                <Table post={post}/>

                <BoardListFooter onChangeAlign={onChangeAlign} align={align}/>

                <Pagination page={page} totalCount={totalCount} postPerPage={postPerPage} onChangePage={onChangePage}/>
            </>
                
    );
}