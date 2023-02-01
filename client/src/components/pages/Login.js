import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setLogin } from '../../modules/users';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Footer from '../Footer';

export default function Login() {

    console.log('=========Login Component Rendering=========');
    const isLogined = useSelector(state => state.userReducer.isLogined);
    console.log('[Login] isLogined: ',isLogined);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [params] = useSearchParams();
    const [checked, setChecked] = useState(false);
    const { state } = useLocation();

    //TODO: Remember me 처리할 것.

    useEffect(() => {
        const expired = params.get('expired');
        if(expired !== null && expired === '') alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    },[params]);

    const onClickLogin = async(e) => {
        try {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const loginData = {
                userId: data.get('userId'),
                password: data.get('password'),
                rememberMe: checked
            };
            const res = await axios.post(`${process.env.REACT_APP_URL}/user/login`,loginData);
            if(res.data.isLogined){
                let user = res.data.userInfo;
                //user.isLogined = true;
                //user.rememberMe = checked;

                //let accessToken = res.data.accessToken;
                //axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                dispatch(setLogin(user)); //store에 유저정보 저장
                //TODO: 이전에 보던 페이지로 이동시키기
                if (state) {
                    console.log('[Login] 이전에 보던 페이지 :',state);
                    navigate(state);
                } else {
                    navigate('/');
                }
            }else {
                alert(res.data.message); //로그인 실패 이유 메시지 출력
            }
        }catch(err) {
            console.log(err);
            alert('로그인 실패');
        }
    }

    const handleChange = (e) => { //로그인 유지 체크
        setChecked(e.target.checked);
    }

    return (
        <Container 
            maxWidth="sm" 
            sx={{
               paddingTop:8
            }}>
                <Box
                    component="form"
                    onSubmit={onClickLogin}
                    sx={{
                        mb: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "#337ab7" }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Login
                    </Typography>
                    <Box>
                        <TextField
                            label="아이디"
                            required
                            fullWidth
                            name="userId"
                            autoFocus
                            margin="normal"
                        />
                        <TextField
                            label="비밀번호"
                            type="password"
                            required
                            fullWidth
                            name="password"
                            margin="normal"
                        />
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={checked} onChange={handleChange}/>}
                            label="로그인 유지"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            로그인
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link to='/findAccount'>아이디/비밀번호 찾기</Link>
                            </Grid>
                            <Grid item>
                                <Link to='/signUp'>계정이 없으신가요?회원가입</Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            <Footer/>
        </Container>

    );
}