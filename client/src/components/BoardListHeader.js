import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';


export default function BoardListHeader({onClickHome,onChangeAlign,align}) {
    const navigate = useNavigate();
    const alignItems = [
        {name:'board_no',role:'최신순'},
        {name:'hits',role:'조회순'},
        {name:'up',role:'추천순'},
        {name:'enroll_date',role:'오래된순'}
    ];

    //정렬 버튼 클릭시 호출
    const onClickAlign = (event) => {
        onChangeAlign(event.target.dataset.name);
    };

    return (
        <Box
            sx={{
            display: 'flex',
            alignItems: 'center',
            borderTop: '1px solid #ccc',
            //(theme) => `2px solid ${theme.palette.divider}`
            bgcolor: 'background.paper',
            color: 'text.secondary'
            }}
        >
            <IconButton onClick={onClickHome} sx={{'&:hover': {backgroundColor:'transparent'}}}>
                <SvgIcon>
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </SvgIcon>
            </IconButton>
            {alignItems.map((item) => (
                <Button
                    key={item.name}
                    sx={{
                        color: (align || 'board_no') === item.name ? '#337ab7' : '#444',
                        display: 'block',
                        fontWeight:'bold',
                        '&:hover': {
                            background: 'none'
                        }
                    }}
                    data-name={item.name}
                    onClick={onClickAlign}
                >
                    {item.role}
                </Button>
            ))}
            <Box sx={{flexGrow:1}}/>
            <Button variant='outlined' sx={{mr:1}} onClick={()=>navigate('/boardWrite')}>글쓰기</Button>
        </Box>
    );
}