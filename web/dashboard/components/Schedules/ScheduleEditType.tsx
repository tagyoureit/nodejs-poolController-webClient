import '../../css/dropdownselect';

import React, { useContext, useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { IConfigOptionsSchedules, IStateSchedule } from '../PoolController';

interface Props
{
    currentSched: IStateSchedule
    options: IConfigOptionsSchedules
    updateSched: (obj: any) => void
}

function ScheduleEditType(props: Props){
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const handleClick = ( event: any ) =>
    {
        let obj = {
            id: props.currentSched.id,
            scheduleType: parseInt(event.target.value, 10)
        }
        props.updateSched(obj);
    }

    const schedTypes = () =>
    {
        let dropdownChildren: React.ReactFragment[] = [];
         props.options.scheduleTypes.forEach(schedType => {
            if (schedType.name === 'Not Used') return;
            let entry:React.ReactFragment = ( <DropdownItem key={`schedule-edit-circuit-${props.currentSched.id}type-${schedType.val}`}
                value={schedType.val}
                onClick={handleClick} 
            >{schedType.desc}</DropdownItem> )

            dropdownChildren.push( entry );
        }); 
        return dropdownChildren;
    }
    
    return (
        <>Schedule Type:
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
                {props.currentSched.scheduleType.desc}
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
               {schedTypes()}
            </DropdownMenu>
        </ButtonDropdown>
  </>
    )
}

export default ScheduleEditType;