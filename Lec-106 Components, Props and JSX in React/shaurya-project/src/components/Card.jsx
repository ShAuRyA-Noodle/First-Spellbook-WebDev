import React from 'react'
import "./Card.css"
const card = (props) => {
  return (
    <div>
    <div className='card' style={{overflow : "hidden"}}>
        <img src="https://hips.hearstapps.com/goodhousekeeping/assets/17/30/pembroke-welsh-corgi.jpg" alt="" width={333}/>
    <h1>{props.title}</h1>
    <p>{props.description}</p>
    </div>
    </div>
  )
}

export default card
