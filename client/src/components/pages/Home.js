import {useLayoutEffect, useState} from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../Pagination';
import Table from '../BoardListTable';
import BoardListHeader from '../BoardListHeader';
import BoardListFooter from '../BoardListFooter';


export default function Home() {
    console.log('=========Home Component Rendering=========');
    const navigate = useNavigate();
    const [params] = useOutletContext();
    const [post,setPost] = useState([]);
    const [totalCount,setTotalCount] = useState(0);
    const align = params.get('align') || 'board_no';
    const category = params.get('cat') || -1;
    const currentPage = params.get('page') || 1;
    const postPerPage = 10; //페이지당 보여줄 데이터 개수

    useLayoutEffect(() => {
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

    //* 정렬방법 선택
    const onChangeAlign = (align) => {
        navigate({
            pathname: '/list',
            search: `align=${align}`,
        });
    };

    //* 카테고리 선택
    const onChangeCategory = (category) => {
        navigate({
            pathname: '/list',
            search: `cat=${category}`,
        });
    };
    
    //* 페이지 변경
    const onChangePage = (nextPage) => {
        navigate({
            pathname: '/list',
            search: `page=${nextPage}`,
        });
        //console.log('[Home Component] Page Change!');
    };

    //* 홈 버튼
    const onClickHome = () => {
        window.location.reload(); //새로고침
    };

    return (
            <>
                <BoardListHeader onClickHome={onClickHome} onChangeCategory={onChangeCategory} category={category}/>

                <Table post={post}/>

                <BoardListFooter onChangeAlign={onChangeAlign} align={align}/>
                
                <Pagination page={currentPage} totalCount={totalCount} postPerPage={postPerPage} onChangePage={onChangePage}/>
            </>
    );
}