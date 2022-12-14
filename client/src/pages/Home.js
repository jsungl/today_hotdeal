import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';


const Home = () => {

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_URL}/test`)
        .then(res => alert(res.data));
    });

    return (
        <div>
            <h1>홈</h1>
            <p>Home 페이지</p>
            <p>{process.env.REACT_APP_MODE}</p>
            <ul>
                <li>
                    <Link to='/about'>소개</Link>
                </li>
                <li>
                    <Link to='/articles'>게시글 목록</Link>
                </li>
                <li>
                    <Link to='/upload'>게시글 업로드</Link>
                </li>
            </ul>

        </div>
    );
};

export default Home;