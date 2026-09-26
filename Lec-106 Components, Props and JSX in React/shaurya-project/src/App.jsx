import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Card from './components/Card'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
    <div className="cards">
      <Card title = "ShauryA_Newbie" description = "Shaurya is the Most Sexy Boi " />
      <Card title = "ShreyA_Newbie" description = "Shreya is the Most Sexy Gurl " />
    </div>
    <Footer/>
    </>
  )
}

export default App
