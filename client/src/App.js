import {useEffect} from 'react';
import axios from 'axios';

function App() {

  useEffect(() => {
    axios.get('http://localhost:5000/test')
    .then(res => console.log(res.data));
  })
  return (
    <div className="App">
      <div>React 웹 페이지</div>
    </div>
  );
}

export default App;
