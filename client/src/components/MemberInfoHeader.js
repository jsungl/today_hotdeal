import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export default function MemberInfoHeader({index, info, post}) {
    const navigate = useNavigate();

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h6" sx={{ p:2 }}>마이페이지</Typography>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <MuiLink component="button" underline="none" sx={{ p:2, borderBottom: index === 0 && 2 }} onClick={()=>{navigate('/memberInfo')}}>기본정보</MuiLink>
                <MuiLink component="button" underline="none" sx={{ p:2, borderBottom: index === 1 && 2 }} 
                    onClick={()=>{navigate('/memberInfo/myDocuments',{state: {isLogined: info.isLogined, userId: info.userId, post}})}}>내 글</MuiLink>
                <MuiLink component="button" underline="none" sx={{ p:2, borderBottom: index === 2 && 2 }}
                    onClick={()=>{navigate('/memberInfo/myComments',{state: {isLogined: info.isLogined, userId: info.userId, post}})}}>내 댓글</MuiLink>
            </Box>
        </Box>
    )
}