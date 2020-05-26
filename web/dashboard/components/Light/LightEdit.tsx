import { Container, Row, Col, Button, Table, DropdownMenu, ButtonDropdown, Dropdown, DropdownItem, DropdownToggle } from 'reactstrap'
import { useAPI } from '../Comms'
import { IConfigOptionsLightGroups } from '../PoolController'
import 'react-rangeslider/lib/index.css'
import '../../css/rangeslider.css'
import React, { useContext, useEffect, useState } from 'react';
import LightColor from './LightEditColorDropdown'
import LightPosition from './LightEditPositionDropdown'
import LightSwimDelay from './LightEditSwimDelay';


interface Props {
    data: IConfigOptionsLightGroups
}

function LightEdit(props: Props) {
    let lightData=
        props.data.lightGroups.map((lg) => {
            return lg.circuits.map((circ, circIdx) => {
                console.log(circ)
                return (<tr key={`lightGroup${ lg.id }lightCircuit${ circIdx }`
                }>
                    <td>
                        {circ.id}
                    </td>
                    <td>
                        {circ.circuit.name}
                    </td>
                    <td>
                        <LightColor
                            circId={circ.id}
                            lgId={lg.id}
                            colors={props.data.colors}
                            color={circ.color} />
                    </td>
                    <td>
                        <LightPosition
                            circId={circ.id}
                            lgId={lg.id}
                            numLights={props.data.lightGroups[lg.id].circuits.length}
                            position={circ.position}
                        />
                    </td>
                    <td>
                        <LightSwimDelay
                            circId={circ.id}
                            lgId={lg.id}
                            swimDelay={circ.swimDelay}
                        />
                    </td>
                </tr>)
            })
        })




    const heightStyle={
        height: '300px'
    }

    return ( <>
      

        <div>
            <Container style={heightStyle} >
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Circuit</th>
                            <th>Color</th>
                            <th>Position</th>
                            <th>Delay</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lightData}
                    </tbody>

                </Table>
            </Container>

        </div >
    </>
    )

}

export default LightEdit;