import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';


export default function BoardListHeader({onClickHome,onChangeCategory,category}) {
    const navigate = useNavigate();
    const categoryItems = [
        {value:0, name:'먹거리'},
        {value:1, name:'PC제품'},
        {value:2, name:'가전제품'},
        {value:3, name:'생활용품'},
        {value:4, name:'의류'},
        {value:5, name:'세일정보'}
    ];

    //* 게시물 정렬
    const onClickCategory = (event) => {
        onChangeCategory(event.target.dataset.value);
    };


    //* 글쓰기 페이지 이동
    const goToWrite = () => {
        navigate('/boardWrite');
    }

    return (
        <Box
            sx={{
            display: "flex",
            alignItems: "center",
            borderTop: "1px solid #ccc",
            //(theme) => `2px solid ${theme.palette.divider}`
            bgcolor: "background.paper",
            color: "text.secondary"
            }}
        >
            <IconButton onClick={onClickHome} sx={{"&:hover": {backgroundColor:"transparent"}}}>
                <SvgIcon>
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </SvgIcon>
            </IconButton>
            {categoryItems.map((item) => (
                <Button
                    key={item.value}
                    sx={{
                        color: Number(category) === item.value ? "#337ab7" : "#444",
                        display: "block",
                        fontWeight:"bold",
                        mx:2,
                        "&:hover": {
                            background: "none"
                        }
                    }}
                    data-value={item.value}
                    onClick={onClickCategory}
                >
                    {item.name}
                </Button>
            ))}
            <Box sx={{flexGrow:1}}/>
            <Button variant="outlined" sx={{mr:1}} onClick={goToWrite}>글쓰기</Button>
        </Box>
    );
}