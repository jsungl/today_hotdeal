import { useLayoutEffect, useState } from 'react';
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
    const page = Number(params.get('page')) || 1;
    const align = params.get('align') || 'board_no';
    const category = params.get('cat') || -1;
    const queryKeyword = params.get('search_keyword');
    const queryTarget = params.get('search_target');
    const [post,setPost] = useState([]); //데이터 목록
    const [totalCount,setTotalCount] = useState(0); //데이터 총 개수
    const postPerPage = 10; //페이지당 보여줄 데이터 개수
    
    //useEffect
    useLayoutEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`${process.env.REACT_APP_URL}/post/getBoardList`,{
                    params:{
                        'align': params.get('align') || 'board_no',
                        'offset': ((Number(params.get('page')) || 1)-1) * postPerPage,
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

    //* 정렬방법 선택
    const onChangeAlign = (selectedAlign) => { 
        if(align) {
            params.set('align',selectedAlign);
        }else {
            params.append('align',selectedAlign);
        }

        setParams(params);
    }

    //* 카테고리 선택
    const onChangeCategory = (category) => {
        if(category) {
            params.set('cat',category);
        }else {
            params.append('cat',category);
        }
        setParams(params);
    };
    
    //* 페이지 변경
    const onChangePage = (nextPage) => {
        if(page) {
            params.set('page',nextPage);
        }else {
            params.append('page',nextPage);
        }

        setParams(params);

    };

    //* 홈 버튼 클릭
    const onClickHome = () => {
        navigate('/');
        //window.location.href = '/';
    };
    
    let BoardListInfo = {
        totalCount,
        align,
        category,
        queryKeyword,
        queryTarget,
        page
    };
    console.log('[BoardList] params: ',BoardListInfo);

    return (
            <>
                <BoardListHeader onClickHome={onClickHome} onChangeCategory={onChangeCategory} category={category}/>

                <Table post={post}/>

                <BoardListFooter onChangeAlign={onChangeAlign} align={align}/>

                <Pagination page={page} totalCount={totalCount} postPerPage={postPerPage} onChangePage={onChangePage}/>
            </>
                
    );
}