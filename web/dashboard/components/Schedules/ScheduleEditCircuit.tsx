import '../../css/dropdownselect';

import React, { useContext, useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { getItemById, IConfigOptionsSchedules, IConfigSchedule, IStateSchedule, PoolContext } from '../PoolController';

var extend = require("extend");

interface Props
{
    currentSched: IStateSchedule
    options: IConfigOptionsSchedules
    updateSched: (obj: any) => void
}

function ScheduleEditCircuit(props: Props){
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const handleClick = ( event: any ) =>
    {
        let obj = {
            id: props.currentSched.id,
            circuit: parseInt(event.target.value, 10)
        }
        props.updateSched(obj);
    }

    const circuitSelectors = () =>
    {
        let dropdownChildren: React.ReactFragment[] = [];
         props.options.circuits.forEach(circ => {
            if (circ.name === 'Not Used') return;
            let entry:React.ReactFragment = ( <DropdownItem key={`schedule-edit-circuit-${props.currentSched.id}circ-${circ.id}`}
                value={circ.id}
                onClick={handleClick} 
            >{circ.name}</DropdownItem> )

            dropdownChildren.push( entry );
        }); 
        return dropdownChildren;
    }
    
    return (
        <>Circuit:
        <ButtonDropdown 
        direction="right"
        size='sm' 
        isOpen={dropdownOpen} 
        toggle={()=>setDropdownOpen(!dropdownOpen)}
        style={{ width: '150px' }}
        className='fullWidth'
        >
            <DropdownToggle 
            caret >
                {props.currentSched.circuit.name}
            </DropdownToggle>
            <DropdownMenu 
            modifiers={{
                setMaxHeight: {
                    enabled: true,
                    order: 890,
                    fn: (data) =>{
                        return {
                            ...data,
                            styles: {
                                ...data.styles,
                                overflow: 'auto',
                                maxHeight: '400px'
                            }
                        }
                    }
                }
            }}
            >
               {circuitSelectors()}
            </DropdownMenu>
        </ButtonDropdown>
  </>
    )
}

export default ScheduleEditCircuit;