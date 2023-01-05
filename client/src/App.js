import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Layout from './components/Layout';
import NotFound from './components/pages/NotFound';
import BoardList from './components/pages/BoardList';
import Board from './components/pages/Board';
import BoardWrite from './components/pages/BoardWrite';
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import FindAccount from './components/pages/FindAccount';
import BoardUpdate from './components/pages/BoardUpdate';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Home/>} />  
        <Route path='list' element={<BoardList />}/>
        <Route path='board/:postId' element={<Board />} />
        <Route path='boardWrite' element={<BoardWrite />} />
        <Route path='boardUpdate/:postId' element={<BoardUpdate />} />
      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/signUp' element={<SignUp />} />
      <Route path='/findAccount' element={<FindAccount />} />
      <Route path='*' element={<NotFound />}/>
    </Routes>
  );
}

export default App;
