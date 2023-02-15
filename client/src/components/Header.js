import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setLogout } from '../modules/users';
//import { Cookies } from 'react-cookie';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAdd from '@mui/icons-material/PersonAdd';
import '../style/header.css'; //google web fonts



export default function Header({target,setTarget,keyword,searchKeyword,searchText}) {
    const title = 'Hot Deal';
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const userId = useSelector(state => state.userReducer.userId);
    const userNickname = useSelector(state => state.userReducer.userNickname);
    const isLogined = useSelector(state => state.userReducer.isLogined);
    //const cookies = new Cookies();

    const handleResize = useCallback(() => {
        if(window.innerWidth > 768 && checked) {
            console.log('check change');
            setChecked(false);
        }
    },[checked]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }

    },[handleResize]);

    const customTheme = createTheme({
        palette: {
            primary: {
                main: '#337ab7',
            },
        },
        breakpoints: {
            values: {
                xs: 0,
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200,
            },
        },
    });

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    // const onChangeInput = (event) => {
        // setKeyword(event.target.value);
    // };

    const onChangeTarget = (event) => {
        setTarget(event.target.value);
    };

    const onClickSearchIcon = (event) => {
        setChecked((prev) => !prev);
    };

    const onClickLoginMenu = () => {
        setAnchorElUser(null);
        navigate('/login', {state: pathname});
    }

    const onClickJoinMenu = () => {
        setAnchorElUser(null);
        navigate('/signUp');
    }
    
    const onClickMypage = () => {
        console.log('마이페이지로 이동');
        setAnchorElUser(null);
        navigate('/memberInfo');
    }

    const onClickLogout = async() => {
        console.log('로그아웃');
        setAnchorElUser(null);
        try {
            const res = await axios.post(`${process.env.REACT_APP_URL}/user/logout`,{userId},{withCredentials: true});
            if(res.data.isLogout){
                dispatch(setLogout()); //store 초기화
                navigate('/');
                //delete axios.defaults.headers.common['Authorization'];
            }

        }catch(err) {
            console.error(err.response.data.message);
            if(err.response.status === 400) alert(err.response.data.message);
        }
    }

    return (
        <Box component="header">
            <ThemeProvider theme={customTheme}>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="static" elevation={0}>
                        <Container maxWidth="xl">
                            {checked ? (
                                <Toolbar disableGutters={true}>
                                    <IconButton
                                        type="button"
                                        sx={{ p: '10px' }}
                                        onClick={onClickSearchIcon}
                                    >
                                        <ArrowBackIcon sx={{ fontSize: 30, color: '#fff' }} />
                                    </IconButton>
                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                        <Paper
                                            component="form"
                                            sx={{
                                                p: '2px 4px',
                                                display: { xs: 'flex', sm: 'flex', md: 'none' },
                                                alignItems: 'center',
                                                width: '100%',
                                            }}
                                            onSubmit={searchKeyword}
                                        >
                                            <FormControl
                                                variant="standard"
                                                sx={{ ml: 1, minWidth: 130 }}
                                                size="small"
                                            >
                                                <Select
                                                    sx={{
                                                        '& .MuiSelect-select:focus': {
                                                            background: 'none',
                                                        },
                                                        '& .MuiSelect-select': {
                                                            paddingBottom: 0,
                                                        },
                                                    }}
                                                    value={target}
                                                    onChange={onChangeTarget}
                                                    disableUnderline
                                                >
                                                    <MenuItem value={'title_content'}>제목+내용</MenuItem>
                                                    <MenuItem value={'title'}>제목</MenuItem>
                                                    <MenuItem value={'content'}>내용</MenuItem>
                                                    <MenuItem value={'writer'}>글쓴이</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <TextField
                                                fullWidth
                                                name="search-keyword"
                                                placeholder="Search"
                                                type="search"
                                                variant="standard"
                                                InputProps={{ disableUnderline: true }}
                                                sx={{ ml: 1 }}
                                                defaultValue={keyword}
                                                inputRef={searchText}
                                            />
                                            <IconButton type="submit" sx={{ p: '10px' }}>
                                                <SearchIcon />
                                            </IconButton>
                                        </Paper>
                                    </Box>
                                </Toolbar>
                            ) : (
                                <Toolbar
                                    disableGutters={true}
                                    sx={{
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        noWrap
                                        sx={{
                                            fontFamily: "Anton",
                                            fontWeight: 400,
                                            letterSpacing: ".1rem",
                                        }}
                                    >
                                        <Link href="/" underline="none" color="#fff" sx={{'&:hover': {textDecoration: "none"}}}>
                                            {title}
                                        </Link>
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Paper
                                            component="form"
                                            sx={{
                                                p: '2px 4px',
                                                display: { xs: 'none', sm: 'none', md: 'flex' },
                                                alignItems: 'center',
                                                width: 500,
                                            }}
                                            onSubmit={searchKeyword}
                                        >
                                            <FormControl
                                                variant="standard"
                                                sx={{ ml: 1, minWidth: 130 }}
                                                size="small"
                                            >
                                                <Select
                                                    sx={{
                                                        '& .MuiSelect-select:focus': {
                                                            background: 'none',
                                                        },
                                                        '& .MuiSelect-select': {
                                                            paddingBottom: 0,
                                                        },
                                                    }}
                                                    value={target}
                                                    onChange={onChangeTarget}
                                                    disableUnderline
                                                >
                                                    <MenuItem value={'title_content'}>제목+내용</MenuItem>
                                                    <MenuItem value={'title'}>제목</MenuItem>
                                                    <MenuItem value={'content'}>내용</MenuItem>
                                                    <MenuItem value={'writer'}>글쓴이</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <TextField
                                                fullWidth
                                                name="search-keyword"
                                                placeholder="Search"
                                                type="search"
                                                variant="standard"
                                                InputProps={{ disableUnderline: true }}
                                                sx={{ ml: 1 }}
                                                defaultValue={keyword}
                                                inputRef={searchText}
                                            />
                                            <IconButton type="submit" sx={{ p: '10px' }}>
                                                <SearchIcon />
                                            </IconButton>
                                        </Paper>
                                    </Box>
                                    <Box sx={{display:'flex'}}>
                                        <IconButton
                                            size="medium"
                                            aria-haspopup="true"
                                            onClick={onClickSearchIcon}
                                            color="inherit"
                                            sx={{display: { xs: 'flex', sm: 'flex', md: 'none' }}}
                                        >
                                            <SearchIcon sx={{ fontSize: 30 }}/>
                                        </IconButton>
                                        <IconButton
                                            size="medium"
                                            aria-label="account of current user"
                                            aria-controls="menu-appbar"
                                            aria-haspopup="true"
                                            onClick={handleMenu}
                                            color="inherit"
                                        >
                                            <AccountCircle sx={{ fontSize: 30 }} />
                                        </IconButton>
                                        
                                        {isLogined ?
                                            <Menu
                                                sx={{ mt: '45px' }}
                                                id="menu-appbar"
                                                anchorEl={anchorElUser}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'center',
                                                }}
                                                keepMounted
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'center',
                                                }}
                                                open={Boolean(anchorElUser)}
                                                onClose={handleCloseUserMenu}
                                            > 
                                                <MenuItem key={'userNickname'}>
                                                    {userNickname} 님
                                                </MenuItem>
                                                <Divider />
                                                <MenuItem key={'mypage'} onClick={onClickMypage}>
                                                    <ListItemIcon>
                                                        <ManageAccountsIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    마이페이지
                                                </MenuItem>
                                                <MenuItem key={'logout'} onClick={onClickLogout}>
                                                    <ListItemIcon>
                                                        <LogoutIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    로그아웃
                                                </MenuItem>
                                            </Menu> 
                                        :
                                            <Menu
                                                sx={{ mt: '45px' }}
                                                id="menu-appbar"
                                                anchorEl={anchorElUser}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'center',
                                                }}
                                                keepMounted
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'center',
                                                }}
                                                open={Boolean(anchorElUser)}
                                                onClose={handleCloseUserMenu}
                                            >
                                                <MenuItem key={'login'} onClick={onClickLoginMenu}>
                                                    <ListItemIcon>
                                                        <LoginIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    로그인
                                                </MenuItem>
                                                <MenuItem key={'join'} onClick={onClickJoinMenu}>
                                                    <ListItemIcon>
                                                        <PersonAdd fontSize="small" />
                                                    </ListItemIcon>
                                                    회원가입
                                                </MenuItem>
                                            </Menu>
                                        }
                                    </Box>
                                </Toolbar>
                            )}
                        </Container>
                    </AppBar>
                </Box>
            </ThemeProvider>
        </Box>
    );
}