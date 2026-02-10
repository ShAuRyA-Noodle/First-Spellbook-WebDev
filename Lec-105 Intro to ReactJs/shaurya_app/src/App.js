import logo from './logo.svg';
import { useState } from 'react';
import "./App.css"
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  //The below line tell that create a new state name "Value" which you can change using setValue and its default value is 0.
  const [value , setValue] = useState(0);
  return (
    <div className="App">
      <Navbar logoText="Shaurya_Newbie"/>
      <div className='value'>{value}</div>
      <button onClick={()=>{
        setValue(value+1)
      }}>Touch Me</button>
      <Footer />
    </div>
  );
}

export default App;
