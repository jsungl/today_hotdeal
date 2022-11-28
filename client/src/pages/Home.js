import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h1>홈</h1>
            <p>Home 페이지</p>
            <ul>
                <li>
                    <Link to='/about'>소개</Link>
                </li>
                <li>
                    <Link to='/articles'>게시글 목록</Link>
                </li>
            </ul>

        </div>
    );
};

export default Home;