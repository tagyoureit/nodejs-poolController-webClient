import '../../css/rangeslider.css';
import 'react-rangeslider/lib/index.css';

import React, { useContext, useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { useAPI } from '../Comms'
import { IDetail, IConfigLightGroup, IConfigLightGroupCircuit } from '../PoolController';

interface Props
{
  circ: IConfigLightGroupCircuit
  lgId: number
  colors: IDetail[]
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
   const [targetColor, setTargetColor] = useState<number>(undefined)
   const [colorDesc, setcolorDesc] = useState(undefined);
   const execute = useAPI();
   let {id: lgcircId, circuit: circuitId,  color} = props.circ;
    useEffect(()=>{
        if (typeof props.circ.color === 'undefined') return;
        if (targetColor === props.circ.color){
            setDisabled(false);
        }
    },[props.circ.color])

    useEffect(() => {
        if (typeof props.colors === 'undefined') return;
        if (typeof targetColor === 'undefined'){
            const _colorDesc = props.colors.find(c=>c.val === props.circ.color).desc;
            setcolorDesc(_colorDesc);
        }
        else {            
            const _colorDesc = props.colors.find(c=>c.val === targetColor).desc;
            setcolorDesc(_colorDesc);
        }
    }, [targetColor, props.colors]);

  const toggleDropDown=  ()=>{   setDropdownOpen(!dropdownOpen); }

  const handleClick = (event) =>
  {
    console.log(`lg... props.data.circuit, event.target.value: ${lgcircId}, ${event.target.value}`)
    //comms.setLightColor( lg... props.circId.circuit, event.target.value )
        setDisabled(true);
        setTargetColor(parseInt(event.target.value))
        execute('configLightGroup', {id: props.lgId, circuits: [{circuit: circuitId, color: event.target.value}]})
  }

    const colorVal = (color:number) =>
    {
      switch ( props.colors.find(c=>c.val === color).name )
      {
        case 'white':
          return { color: 'gray', background: 'white' }
        case 'lightgreen':
          return { background: 'lightgreen', color: 'green' }
        case 'green':
          return { background: 'green', color: 'lightgreen'}
        case 'cyan':
          return { background: 'cyan', color: 'blue' }
        case 'blue':
            return { background: 'blue', color: 'white' }
        case 'lavender':
          return { background: 'lavender', color: 'darkmagenta' }
        case 'magenta':
          return { background: 'darkmagenta', color: 'lavender' }      
        case 'lightmagenta':
          return { background: 'magenta', color: 'black' }      
      }
    }

    return (
      <div>
        <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropDown} disabled={disabled} >
          <DropdownToggle caret style={colorVal(targetColor||props.circ.color)} disabled={disabled}>
            {colorDesc}
            </DropdownToggle>
          <DropdownMenu>
            {props.colors.map(color=>{
                return <DropdownItem key={`c${lgcircId}lg${props.lgId}color${color.val}`} onClick={handleClick} value={color.val} style={colorVal(color.val)}>{color.desc}</DropdownItem>
            })}
            
          </DropdownMenu>
        </ButtonDropdown>

      </div >

    )
  }


export default LightColor;