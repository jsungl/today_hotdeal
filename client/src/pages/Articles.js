import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Articles = () => {
    const [list, setList] = useState([]);

    useEffect(() => {
        async function getList() {
            try{
                const result = await axios.get(`${process.env.REACT_APP_URL}/postList`);
                const data = result.data.map(data=>data);
                setList(data);
            } catch(e) {
                console.error(e.message);
            }
        }
        getList();
    },[]);

    return (
        <div>
            <h1>게시글 목록</h1>
            <p>Articles 페이지</p>
            <ul>
                {list.map(data => (
                    <li key={data.id}>
                        <Link to={`/article/${data.id}`}>게시글 {data.id}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Articles;