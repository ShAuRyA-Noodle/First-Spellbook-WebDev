import React, { useEffect } from 'react'

const Navbar = ({ color }) => {
  useEffect(() => {
    alert("Color was Changed!!!")
  }, [color])
  //This below one will run on every render
  useEffect(() => {
    alert("Hey Cutie wapis se aagye aap !!!!")
  },)
  //The below one will only run on 1st render
  useEffect(() => {
    alert("Hey Cutie welcome to my Page")
  }, [])
  //Example of Cleanup Function 
  useEffect(() => {
    alert("hello this is the first render app.jsx")
    return () => {
      //This will run when we remove Navbar.jsx from App.jsx 
      alert("Component was unmounted")
    }
  }, [])


  return (
    <div>
      Hi I am Navbar of {color} color hehehe.....
    </div>
  )
}

export default Navbar
