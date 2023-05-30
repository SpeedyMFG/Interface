import React from 'react'
import "./input.css"
function Input({type,placeHolder,onChange,onClick}) {
  return (
    <input 
    className='input' 
    type={type} 
    placeholder={placeHolder}
    onChange={onChange}
    onClick={onClick}
    />    
  )
}

export default Input;