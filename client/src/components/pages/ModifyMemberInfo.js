import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLogin } from '../../modules/users';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styled from 'styled-components';


const InfoBox = styled.div`
    color: #777;
`;


export default function ModifyMemberInfo({isLogined, userInfo}) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    //const location = useLocation();
    const [emailError, setEmailError] = useState('');
    const [nameError, setNameError] = useState('');
    // const isLogined = location.state.isLogined;
    // const userInfo = location.state.userInfo;
    console.log('[ModifyMemberInfo] isLogined: ',isLogined);
    console.log('[ModifyMemberInfo] userInfo: ',userInfo);

    const theme = createTheme({
        palette: {
          primary: {
            main: '#337ab7',
          },
        },
    });

    const onhandlePost = async(data) => {
        console.log(data);
        try {
            const res = await axios.post(`${process.env.REACT_APP_URL}/user/modifyMemberInfo`, data, {withCredentials: true});
            if(res.data.isModified){
                alert('회원정보 변경 완료');
                dispatch(setLogin(res.data.userInfo));
                navigate('/memberInfo',{replace:true});
            }

        }catch(err) {
            if(err.response.status === 409) {
                alert(err.response.data.message);
                err.response.data.duplication === 'nickname' ? setNameError('다른 닉네임을 입력해주세요.') : setEmailError('다른 이메일을 입력해주세요.')
            }else if(err.response.status === 301) {
                navigate('/',{ replace: true });
            }else {
                console.log(err);
                alert('회원정보 변경 실패');
            }
        }
    }

    const modifyMemberInfo = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const modifiedData = {
            userId:userInfo.id,
            nickName: data.get('nickName'),
            email: data.get('email')
        };
        const { nickName, email } = modifiedData;
        

        if(userInfo.nickname === nickName && userInfo.email === email) {
            alert('회원정보 변경 완료');
            navigate('/memberInfo',{replace:true});
        
        }
            
        // 닉네임 유효성 검사
        const nameRegex = /^[가-힣a-zA-Z0-9]{2,8}$/;
        if (!nameRegex.test(nickName) || nickName.length < 1) setNameError('올바른 닉네임 형식이 아닙니다.');
        else setNameError('');
        
        // 이메일 유효성 체크
        const emailRegex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
        if (!emailRegex.test(email)) setEmailError('올바른 이메일 형식이 아닙니다.');
        else setEmailError('');
            

        if (
            nameRegex.test(nickName) && 
            emailRegex.test(email) &&
            isLogined
        ) {
            onhandlePost(modifiedData);
        }
    }

    return(
        <Box sx={{width:'100%'}}>
            <Typography variant="h6" sx={{ mb:2 }}>회원정보 변경</Typography>
            <Box component="form" onSubmit={modifyMemberInfo}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    align="center" 
                                    colSpan={2} 
                                    sx={{
                                        borderTop:"2px solid #444",
                                        borderBottom:"1px solid #888",
                                        fontWeight:"700"
                                    }}
                                >
                                    기본 정보
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ background:"#f9f9f9", width:'10%', textAlign:'center' }}>
                                    <Typography>아이디</Typography>
                                </TableCell>
                                <TableCell>{userInfo.id}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ background:"#f9f9f9" }}>
                                    <Typography>닉네임</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name="nickName" size="small" error={nameError !== ''} defaultValue={userInfo.nickname} required/>
                                    <FormHelperText error>{nameError}</FormHelperText>
                                    <InfoBox>
                                        <span>닉네임은 2~8자 이내 한글 또는 영어여야 합니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ background:"#f9f9f9", borderBottom:"1px solid #888" }}>
                                    <Typography noWrap>이메일 주소</Typography>
                                </TableCell>
                                <TableCell sx={{ borderBottom:"1px solid #888" }}>
                                    <TextField name="email" size="small" error={emailError !== ''} defaultValue={userInfo.email} required/>
                                    <FormHelperText error>{emailError}</FormHelperText>
                                    <InfoBox>
                                        <span>메일주소는 메일인증 후 비밀번호 변경이나 찾기 등에 사용됩니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    spacing={2}
                    sx={{
                        mt:3,
                        mb:2
                    }}
                >
                    <ThemeProvider theme={theme}>
                        <Button type="submit" variant="contained" size="small">등록</Button>
                        <Button variant="contained" size="small" onClick={()=>navigate(-1)}>취소</Button>
                    </ThemeProvider>
                </Stack>
            </Box>
        </Box>
    );
}