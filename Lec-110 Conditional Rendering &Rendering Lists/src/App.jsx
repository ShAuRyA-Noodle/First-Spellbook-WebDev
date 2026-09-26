import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [showbtn, setshowbtn] = useState(false)
  const [todos, setTodos] = useState([
    {
      title : "Hey Cutie",
      desc : "Hi i am ShAuRyA_Newbie"
    },
        {
      title : "Hey Sexy Bitch",
      desc : "Hi i am CutiePie"
    },
        {
      title : "Hey Chutiye",
      desc : "Hi i am Bhen Ka Best Bhai"
    },
    
  ])

  const Todo = ({ todo }) => {
    return (<>
    <div className="m-4 border border-2 border-purple-400">
      <div className="todo">{todo.title}</div>
      <div className="todo">{todo.desc}</div>
    </div>
    </>)
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      {/* {showbtn? <button>Only Shown When Clicked</button>:"Shaurya Punj"} */}
      {/* The below command means that button will only work when showbtn is true else it will show nothing */}
      {showbtn && <button>Only Shown When Clicked</button>}
      {/* <Todo /> */}
      {todos.map(todo =>{
        return <Todo key={todo.title} todo={todo}/>
      })}
      <div className="card">
        <button onClick={() => setshowbtn(!showbtn)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
