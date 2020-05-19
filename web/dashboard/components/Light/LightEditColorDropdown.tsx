import '../../css/rangeslider.css';
import 'react-rangeslider/lib/index.css';

import React, { useContext, useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { IDetail } from '../PoolController';

interface Props
{
  circId: number
  lgId: number
  colors: IDetail[]
  color: IDetail
}

interface State
{
  dropdownOpen: boolean
  disabled: boolean
  targetColor: number
}

function LightColor(props:Props) {
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const [disabled, setDisabled] = useState(false);
   const [targetColor, setTargetColor] = useState<number>(-1)

    useEffect(()=>{
        if (typeof props.color !== 'undefined' && targetColor !== props.color.val){
            setTargetColor(props.color.val);
            setDisabled(false);
        }
    },[props.color.val, props.color, targetColor])

  const toggleDropDown=  ()=>{   setDropdownOpen(!dropdownOpen); }

  const handleClick = (event) =>
  {
    console.log(`lg... props.data.circuit, event.target.value: ${props.circId}, ${event.target.value}`)
    //comms.setLightColor( lg... props.circId.circuit, event.target.value )
      setDisabled(true);
      setTargetColor(parseInt(event.target.value))
  }


    const colorVal = () =>
    {
      switch ( props.color.name )
      {
        case 'white':
          return { color: 'white', background: 'gray' }
        case 'lightgreen':
          return { background: 'white', color: 'lightgreen' }
        case 'green':
          return { background: 'white', color: 'green'}
        case 'cyan':
          return { background: 'white', color: 'cyan' }
        case 'blue':
        return { background: 'white', color: 'blue' }
        case 'lavender':
          return { background: 'white', color: 'lavender' }
        case 'darkmagenta':
          return { background: 'white', color: 'darkmagenta' }      
        case 'lightmagenta':
          return { background: 'white', color: 'magenta' }      
      }
    }

    return (
      <div>
        <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropDown} disabled={disabled} >
          <DropdownToggle caret style={colorVal()}  disabled={disabled}>
            {props.color.desc}
                    </DropdownToggle>
          <DropdownMenu>
            {props.colors.map(color=>{
                return <DropdownItem key={`c${props.circId}lg${props.lgId}color${color.val}`} onClick={handleClick} value={color.val}>{color.desc}</DropdownItem>
            })}
          </DropdownMenu>
        </ButtonDropdown>

      </div >

    )
  }


export default LightColor;