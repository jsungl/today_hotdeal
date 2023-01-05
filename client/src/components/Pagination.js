import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Pagination from 'react-js-pagination';
import '../style/pagination.css';

export default function Page({page,totalCount,postPerPage,onChangePage}) {

    return (
        <Grid 
            container 
            justifyContent="center"
        >
            <Grid item xs={12} sm="auto">
                <Box display="flex" justifyContent="center" alignItems="center">
                    <Pagination 
                        activePage={page || 1} // 현재 페이지 번호
                        itemsCountPerPage={postPerPage} // 한 페이지당 보여줄 데이터 갯수
                        totalItemsCount={totalCount} // 총 데이터 갯수
                        pageRangeDisplayed={5} // 한번에 보여줄 페이지 번호 갯수
                        prevPageText={"이전"} // "이전"을 나타낼 텍스트
                        nextPageText={"다음"} // "다음"을 나타낼 텍스트
                        firstPageText={"처음"}
                        lastPageText={"끝"}
                        onChange={onChangePage} // 페이지 변경시 호출되는 함수
                    />
                </Box>
            </Grid>    
        </Grid>
    );

}