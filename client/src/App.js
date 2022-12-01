import {useEffect} from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Article from './pages/Article';
import Articles from './pages/Articles';
import Layout from './pages/Layout';
import NotFound from './pages/NotFound';

function App() {

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_URL}/test`)
    .then(res => alert(res.data));
  })
  return (
    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Home/>} />  
        <Route path='/about' element={<About/>} />
        <Route path='/articles' element={<Articles/>} />
        <Route path='/article/:id' element={<Article/>} />  
      </Route>
      <Route path='*' element={<NotFound/>} />
    </Routes>
  );
}

export default App;
