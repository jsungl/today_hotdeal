import { Link } from 'react-router-dom';

const Articles = () => {
    return (
        <div>
            <h1>게시글 목록</h1>
            <p>Articles 페이지</p>
            <ul>
                <li>
                    <Link to='/article/1'>게시글 1</Link>
                </li>
                <li>
                    <Link to='/article/2'>게시글 2</Link>
                </li>
                <li>
                    <Link to='/article/3'>게시글 3</Link>
                </li>
            </ul>
        </div>
    );
};

export default Articles;