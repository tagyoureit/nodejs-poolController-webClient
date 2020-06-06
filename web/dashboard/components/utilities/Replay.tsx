import React, { useEffect, useState, useContext, useRef } from 'react';
import { useAPI } from '../Comms';
import { PoolContext, IConfigOptionsLightGroups } from '../PoolController';
import UtilitiesLayout from './UtilitiesLayout';
import {
    Button, InputGroup, InputGroupAddon, InputGroupText, Input,
    Form, FormGroup, Label, FormText, Row, Col,
    Dropdown, DropdownItem, DropdownToggle, DropdownMenu
} from 'reactstrap';
import ReactDataGrid, { GridRowsUpdatedEvent, RowUpdateEvent, SelectionParams } from 'react-data-grid';
import CustomCard from '../CustomCard'
/* interface State {
    [k: string]: any
    replayFile?: any
    packets: IPackets[];
    numPackets: number
    columns: {[key: string]: any}
    selectedIndexes: number[]
    replayTimer?: NodeJS.Timeout
    runTo: number; // 
    lineToSend: number // which line/packet will be sent next
    linesSent: number // counter for sent packets
    replayButtonColor: string
    replayButtonText: string
    replayDirection: 'toApp'|'toBus'
    directionDropDownOpen: boolean
    includePacketTypeDropDownOpen: boolean
    includePacketTypes: DirectionType|'both'
} */

type PacketType='packet'|'socket'|'api'
type DirectionType='inbound'|'outbound'
type ShortDirectionType='in'|'out'
interface IPackets {
    counter: number
    type: PacketType
    direction?: DirectionType
    dir?: ShortDirectionType
    level: string
    timestamp: string
    packet?: number[]
    pkt?: number[][]
}

function Replay(props) {
    const dateFormatter=(({ value }: { value: string }): React.ReactElement => {
        let date=new Date(value)
        return <>{`${ date.toTimeString() }`}</>
    })


    const [numPackets, setNumPackets]=useState(0);
    const [columns, setColumns]=useState<ReactDataGrid.Column<any>[]>(
        [
            { key: `counter`, name: `#`, width: 80 },
            { key: 'proto', name: 'Protocol', width: 75 },
            { key: `direction`, name: `Direction`, width: 90 },
            { key: 'timestamp', name: 'H:M:S.s', width: 110, formatter: dateFormatter },
            { key: 'packet', name: 'Packet', formatter: ({ value }: { value: number[] }): React.ReactElement => {
                try {
                    if (version === 5) return <>{value.join(',')}</>
                    else return <>{value.slice(2,4)}</>
                }
                catch (err){
                    return <>{value}</>
                }
        
            } }
        ]);
    const [packets, setPackets]=useState([]);
    const [selectedIndexes, setselectedIndexes]=useState([]);
    const [runTo, setrunTo]=useState(0);
    // const [lineToSend, setlineToSend]=useState(0);
    const lineToSend = useRef(0)
    const [lineSent, setlinesSent]=useState(0);
    const [replayButtonColor, setreplayButtonColor]=useState('primary');
    const [replayButtonText, setreplayButtonText]=useState('Replay');
    const [replayDirection, setreplayDirection]=useState('toApp');
    const [directionDropDownOpen, setdirectionDropDownOpen]=useState(false);
    const [includePacketTypeDropDownOpen, setincludePacketTypeDropDownOpen]=useState(false);
    const [includePacketTypes, setincludePacketTypes]=useState('inbound');
    const [loadedFile, setloadedFile]=useState<any>();
    const execute=useAPI();
    const { socket }: { socket: SocketIOClient.Socket }=useContext(PoolContext);
    const [version, setversion]=useState(5);
    let replayTimer: any=useRef()

    const onRowsSelected=(rows: SelectionParams<any>[]) => {
        console.log(`pressed row ${ rows[0].rowIdx }`)
        setrunTo(rows[0].rowIdx);
        runToThisLine(rows[0].rowIdx)
    };

    /**
     * This can be triggered by the Choose File input button in 
     * which case the param will be passed.  Or it will be called
     * by reset in which case we load the file from replayFile
     * @param event file that will be uploaded
     */
    const handleFile=(event?: any) => {
        const reader=new FileReader()

        let files=event===undefined? loadedFile:event.currentTarget.files;
        // check to make sure reset button wasn't clicked before loading a file

        if(files.length>0) {
            let _file=files[0]
            // store file for reloading during reset
            console.log('reloading')

            setloadedFile([_file])
            setrunTo(0)
            setlinesSent(0)  // counter for sent packets
            lineToSend.current = 0  // which line/packet will be sent next
            setselectedIndexes([])
            reader.readAsText(_file)
        }

        reader.onload=(event: any) => {
            const file: any=event.target.result;
            let rawLines: string[]=file.split(/\r\n|\n/);
            let allLines: IPackets[]=[];

            // Reading line by line
            rawLines.forEach((_line) => {
                if(_line.length>10) {
                    try {
                        allLines.push(JSON.parse(_line))
                    }
                    catch(err) {
                        console.log(`trouble reading line: ${ _line } - ${ err.message }`)
                    }
                }
            });

            let totalPackets: number=0;
            allLines.forEach((line: any) => {
                Object.assign(line, { counter: totalPackets });
                totalPackets++

            })

            // check if old or new format
            if(Array.isArray(allLines[0].pkt[0])) {
                setversion(6);
                setincludePacketTypes('in');
                setColumns([{ key: `counter`, name: `#`, width: 80 },
                { key: 'proto', name: 'Proto', width: 75 },
                { key: `dir`, name: `Direction`, width: 90 },
                { key: 'ts', name: 'H:M:S.s', width: 110, formatter: dateFormatter },
                { key: 'pkt', name: 'Packet', formatter: ({ value }: { value: number[] }): React.ReactElement => {
                    try {
                        return <>{JSON.stringify(value.slice(2))}</>
                    }
                    catch (err){
                        return <>{value}</>
                    }
            
                } }
                ])
            }
            setPackets(allLines);
            setNumPackets(Object.keys(allLines).length);
        }
    }
    const handleReset=() => {
        setrunTo(0);
        setlinesSent(0);  // counter for sent packets
        lineToSend.current = 0;  // which line/packet will be sent next
        setNumPackets(0);
        setPackets([]);
        setselectedIndexes([]);
        resetIntervalTimer()
        handleFile()
    }
/*     useEffect(() => {
        return () => {
            handleReset();
        }
    }, []); */



    const resetIntervalTimer=() => {
        setreplayButtonColor('primary')
        setreplayButtonText('Replay')
        clearTimeout(replayTimer.current)
    }

    const runToThisLine=(runTo: number) => {
        if(typeof replayTimer.current!=='undefined') {
            clearTimeout(replayTimer.current)
        }
        let packetPackage: number[][]=[]
        console.log(`lineToSend: ${ lineToSend.current }  runTo:  ${ runTo }`)
        console.log(`sending ${ runTo-lineToSend.current+1 } lines`);

        let _lineToSend=lineToSend.current
        let _linesSentArr: number[]=[]
        for(_lineToSend;_lineToSend<=runTo;_lineToSend++) {
            if(version===5) {
                if(includePacketTypes===packets[_lineToSend].direction||includePacketTypes==='both') {

                    if(_lineToSend<=numPackets) {
                        packetPackage.push(packets[_lineToSend].packet)
                    }
                    // set checkbox for selected items
                    _linesSentArr=_linesSentArr.concat(_lineToSend)
                }
            }
            else {
                if(packets[_lineToSend].proto==='api') continue;
                if(includePacketTypes===packets[_lineToSend].dir||includePacketTypes==='both') {
                    if(_lineToSend<=numPackets) {
                        packetPackage.push(packets[_lineToSend].pkt)
                    }
                    // set checkbox for selected items
                    _linesSentArr=_linesSentArr.concat(_lineToSend)
                }
            }
        }
        replayDirection==='toApp'? socket.emit('replayPackets', packetPackage):socket.emit('sendPacket', packetPackage);
        console.log(`sent up to #${ _lineToSend-1 }.  total packets ${ packetPackage.length } `)
        setselectedIndexes(indxs => indxs.concat(_linesSentArr));
        lineToSend.current = _lineToSend;

    }

    const handleReplayButton=() => {
        if(replayButtonText==='Replay') {
            if(numPackets>0) {

                setreplayButtonColor('success')
                setreplayButtonText('Replaying...');
                replayTimer.current=setInterval(replayFile, 225);

            }
            else {
                console.log('No packets to send yet')
            }
        }
        else {
            resetIntervalTimer()
        }
    }
    const handleIncludeDirectionChange=(event) => {
        setreplayDirection(event.target.value);
    }
    const toggleIncludePacketTypes=() => {
        setincludePacketTypeDropDownOpen(dd => !dd);
    }
    const toggleDirectionDropDown=() => {
        setdirectionDropDownOpen(dir => !dir);
    }
    const handleIncludePacketTypes=(event) => {
        if (version === 5) setincludePacketTypes(event.target.value);
        else {
            if (event.target.value === 'inbound') setincludePacketTypes('in')
            else if (event.target.value === 'outbound') setincludePacketTypes('out')
            else setincludePacketTypes(event.target.value)
        }
    }

    /*
    
    export function sendPacket ( arrToBeSent: number[][] )
    {
        socket.emit( 'sendPacket', arrToBeSent )
    }
    
    export function receivePacket ( arrToBeSent: number[][] )
    {
    
        socket.emit( 'receivePacket', JSON.stringify( arrToBeSent ) )
    }
    
    export function receivePacketRaw ( packets: number[][] )
    {
        socket.emit( 'receivePacketRaw', packets )
    }
    */



    const replayFile=() => {
        if(lineToSend.current<numPackets) {
            if (version === 5){
                if(includePacketTypes===packets[lineToSend.current].direction||includePacketTypes==='both') {
                    if(replayDirection==='toApp') {
                        socket.emit('replayPackets', [packets[lineToSend.current].packet])
                        console.log(`sending for app ${ lineToSend.current }: ${ packets[lineToSend.current].packet.toString() }`)
                    }
                    else {
                        socket.emit('sendPackets', [packets[lineToSend.current].packet]); 
                        console.log(`sending for RS485 bus ${ lineToSend.current }: ${ packets[lineToSend.current].packet.toString() }`)
                        
                    }
                    lineToSend.current = lineToSend.current + 1;
                    setselectedIndexes(indxs => indxs.concat(lineToSend.current))
                }
                else {
                    lineToSend.current = lineToSend.current + 1;
                }
            }
            else {
                if(includePacketTypes===packets[lineToSend.current].dir||includePacketTypes==='both' && packets[lineToSend.current].proto!=='api') {
                    if(replayDirection==='toApp') {
                        socket.emit('replayPackets', [packets[lineToSend.current].packet])
                        // execute('receivePacketRaw', [packets[lineToSend.current].pkt]);
                        console.log(`sending for app ${ lineToSend.current }: ${ packets[lineToSend.current].pkt.toString() }`)
                    }
                    else {
                        socket.emit('sendPackets', [packets[lineToSend.current].packet]); 
                        // execute('replayPackets', [packets[lineToSend.current].pkt]);
                        console.log(`sending for RS485 bus ${ lineToSend.current }: ${ packets[lineToSend.current].pkt.toString() }`)
                        
                    }
                    console.log(`lineTosend: ${lineToSend.current}`)
                    lineToSend.current = lineToSend.current + 1;
                    console.log(`lineTosend after: ${lineToSend}`)
                    setselectedIndexes(indxs => indxs.concat(lineToSend))
                }
                else {
                    lineToSend.current = lineToSend.current + 1;
                }
            }
        }
        else {
            setreplayButtonColor('primary')
            setreplayButtonText('Replay')
            clearTimeout(replayTimer);
        }
    }

    return (<>
        <CustomCard name={props.id} id={props.id}>

            <h1> Replay Packets</h1>
            <Row>
                <Col>
                    <Form>
                        <FormGroup row>
                            <Label for="replayfile" sm={2}></Label>
                            <Col sm={10}>
                                <Input type="file" name="replayfile" onChange={handleFile} />
                                <FormText color="muted">
                                    Choose a replay .json file.
                                </FormText>
                            </Col>
                        </FormGroup>

                    </Form>
                </Col>
                <Col>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">Replay Packet Count</InputGroupAddon>
                        <Input value={`${ lineToSend.current } of ${ numPackets }`} readOnly />
                    </InputGroup>

                </Col>
            </Row>
            <Row className='mb-2'>
                <Button color={replayButtonColor} className='mr-1' onClick={handleReplayButton}>{replayButtonText}</Button>
                <Button color='primary' className='mr-1' onClick={handleReset}>Reset</Button>

            </Row>
            <Row className='mb-2'>
                <Dropdown isOpen={includePacketTypeDropDownOpen} toggle={toggleIncludePacketTypes} className='mr-1' >
                    <DropdownToggle caret color='primary' >
                        {includePacketTypes==='both'? 'both ':`Only ${ includePacketTypes }`} packets
                        </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={handleIncludePacketTypes} value='inbound'>Only inbound</DropdownItem>
                        <DropdownItem onClick={handleIncludePacketTypes} value='outbound'>Only outbound</DropdownItem>
                        <DropdownItem onClick={handleIncludePacketTypes} value='both'>both</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown isOpen={directionDropDownOpen} toggle={toggleDirectionDropDown}>
                    <DropdownToggle caret color='primary' >
                        Replay to {replayDirection==='toApp'? 'App':'RS485'}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={handleIncludeDirectionChange} value='toApp'>App</DropdownItem>
                        <DropdownItem onClick={handleIncludeDirectionChange} value='toBus'>RS485</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </Row>
            <Row>
                <ReactDataGrid
                    columns={columns}
                    rowGetter={(i: number) => packets[i]}
                    rowsCount={numPackets}
                    minHeight={550}
                    minColumnWidth={30}
                    headerRowHeight={65}
                    rowSelection={{
                        showCheckbox: true,
                        onRowsSelected: onRowsSelected,
                        selectBy: {
                            indexes: selectedIndexes
                        }
                    }}
                />

            </Row>
        </CustomCard>
    </>
    );

}

export default Replay;