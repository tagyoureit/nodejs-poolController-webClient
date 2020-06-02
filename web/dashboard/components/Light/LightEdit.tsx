import '../../css/rangeslider.css';
import 'react-rangeslider/lib/index.css';

import React, { useContext, useEffect, useState } from 'react';
import { Container, Table } from 'reactstrap';

import { IConfigOptionsLightGroups } from '../PoolController';
import LightColor from './LightEditColorDropdown';
import LightPosition from './LightEditPositionDropdown';
import LightSwimDelay from './LightEditSwimDelay';

interface Props {
    data: IConfigOptionsLightGroups;
}

function LightEdit(props: Props) {
    let lightData=
        props.data.lightGroups.map((lg, lgIdx) => {
            return (<Table key={`lightGroup${ lg.id }lightidx${ lgIdx }`}><thead >
                <tr >
                    <td>
                    {lg.name}
                    </td>
                </tr>
                <tr>
                    <th>#</th>
                    <th>Circuit</th>
                    <th>Color</th>
                    <th>Position</th>
                    <th>Delay</th>
                </tr>
            </thead>
                <tbody>

                    {lg.circuits.map((circ, circIdx) => {
                        return (
                            <tr key={`lightGroup${ lg.id }lightgidx${ lgIdx }circ${ circIdx }`}>
                                <td>
                                    {circ.id}
                                </td>
                                <td>
                                    {props.data.circuits.find(c => c.id===circ.circuit)?.name}
                                </td>
                                <td>
                                    <LightColor
                                        circ={circ}
                                        lgId={lg.id}
                                        colors={props.data.colors}
                                    />
                                </td>
                                <td>
                                    <LightPosition
                                        circ={circ}
                                        lgId={lg.id}
                                        numLights={props.data.lightGroups[lgIdx].circuits.length}
                                    />
                                </td>
                                <td>
                                    <LightSwimDelay
                                        circ={circ}
                                        lgId={lg.id}
                                    />
                                </td>
                            </tr>);
                    })}
                </tbody>
            </Table>

            );
        });

    const heightStyle={
        height: '300px'
    };

    return (<>
        <div>
            <Container style={heightStyle} >
                {lightData}
            </Container>

        </div >
    </>
    );
}

export default LightEdit;