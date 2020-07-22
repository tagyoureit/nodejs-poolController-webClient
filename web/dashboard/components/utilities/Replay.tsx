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


type PacketType = 'packet' | 'socket' | 'api'
// type DirectionType='in'|'out'
type ShortDirectionType = 'in' | 'out'
interface IPackets {
    id: number
    counter: number
    type: PacketType
    dir: ShortDirectionType
    ts: Date
    pkt?: number[][]
    path?: string;
}

function Replay(props) {
    const dateFormatter = (({ value }: { value: Date }): React.ReactElement => {
        return <>{`${value.toTimeString()}`}</>
    })
    const [numPackets, setNumPackets] = useState(0);
    const [columns, setColumns] = useState<ReactDataGrid.Column<any>[]>(
        [
            { key: `counter`, name: `Cnt`, width: 40 },
            { key: `id`, name: `id`, width: 40 },
            { key: 'type', name: 'Type', width: 75 },
            { key: `dir`, name: `Dir`, width: 40 },
            { key: 'ts', name: 'TS', width: 110, formatter: dateFormatter },
            {
                key: 'pkt', name: 'Packet', formatter: ({ value }: { value: number[][] }): React.ReactElement => {
                    try {

                        return <>{value.slice(2, 4).toString()}</>
                    }
                    catch (err) {
                        return <>{value.toString()}</>
                    }
                }
            }
        ]);
    const [packets, setPackets] = useState<IPackets[]>([]);
    const [selectedIndexes, setselectedIndexes] = useState([]);
    const lineToSend = useRef(0)
    const [lineSent, setlinesSent] = useState(0);
    const [replayButtonColor, setreplayButtonColor] = useState('primary');
    const [replayButtonText, setreplayButtonText] = useState('Replay');
    const [replayDirection, setreplayDirection] = useState('toApp');
    const [directionDropDownOpen, setdirectionDropDownOpen] = useState(false);
    const [includePacketTypeDropDownOpen, setincludePacketTypeDropDownOpen] = useState(false);
    const [includePacketTypes, setincludePacketTypes] = useState('in');
    const [loadedFile, setloadedFile] = useState<any>();
    const { socket }: { socket: SocketIOClient.Socket } = useContext(PoolContext);
    let replayTimer: any = useRef()
    let replayspeed = useRef(25)

    const onRowsSelected = (rows: SelectionParams<any>[]) => {
        runToThisLine(rows[0].row.counter);
    };

    /**
     * This can be triggered by the Choose File input button in 
     * which case the param will be passed.  Or it will be called
     * by reset in which case we load the file from replayFile
     * @param event file that will be uploaded
     */
    const handleFile = (event?: any) => {
        const reader = new FileReader()

        let files = event === undefined ? loadedFile : event.currentTarget.files;
        // check to make sure reset button wasn't clicked before loading a file

        if (files.length > 0) {
            let _file = files[0]
            // store file for reloading during reset
            console.log('reloading replay')
            setloadedFile([_file]);
            setlinesSent(0)  // counter for sent packets
            lineToSend.current = 0  // which line/packet will be sent next
            setselectedIndexes([])
            reader.readAsText(_file)
        }

        reader.onload = (event: any) => {
            const file: any = event.target.result;
            let rawLines: string[] = file.split(/\r\n|\n/);
            let allLines: IPackets[] = [];
            let totalPackets: number = 1;
            for (let i = 0; i < rawLines.length; i++, totalPackets++) {
                try {
                    let parsedLine = JSON.parse(rawLines[i]);
                    let entry: IPackets = {
                        counter: i,
                        id: parsedLine.id || i + 1,
                        pkt: [],
                        dir: 'out',
                        type: 'packet',
                        ts: new Date()
                    };
                    if (new Date(parsedLine.ts).toString() !== 'Invalid Date') entry.ts = new Date(parsedLine.ts);
                    if (new Date(parsedLine.timestamp).toString() !== 'Invalid Date') entry.ts = new Date(parsedLine.timestamp);
                    if (typeof parsedLine.url !== 'undefined' || typeof parsedLine.path !== 'undefined') {
                        // api
                        entry.type = 'api';
                        entry.path = parsedLine.path || parsedLine.url;
                    }
                    else {
                        // packets
                        entry.type = 'packet';
                        entry.pkt = parsedLine.pkt || [[], [], parsedLine.packet];
                    }
                    if (parsedLine?.direction?.includes('in') || parsedLine?.dir?.includes('in')) entry.dir = 'in';
                    allLines.push(entry);
                }
                catch (err) {
                    console.log(`trouble reading line: ${rawLines[i]} - ${err.message}`)
                }
            }
            setPackets(allLines);
            setNumPackets(Object.keys(allLines).length);
        }
    }
    const handleReset = () => {
        setlinesSent(0);  // counter for sent packets
        lineToSend.current = 0;  // which line/packet will be sent next
        setNumPackets(0);
        setPackets([]);
        setselectedIndexes([]);
        resetReplayButton()
        handleFile()
    }

    const resetReplayButton = () => {
        setreplayButtonColor('primary')
        setreplayButtonText('Replay')
        clearTimeout(replayTimer.current)
    }

    const runToThisLine = (runTo: number) => {
        if (typeof replayTimer.current !== 'undefined') {
            clearTimeout(replayTimer.current)
        }
        let packetPackage: number[][] = [];
        let replayedIndxs = [];
        for (; lineToSend.current <= runTo;) {
            if (packets[lineToSend.current].type === 'packet') {
                if (includePacketTypes === packets[lineToSend.current].dir || includePacketTypes === 'both') {
                    if (lineToSend.current <= numPackets) {
                        let packetArr = buildPackets(packets[lineToSend.current]);
                        if (typeof packetArr !== 'undefined') {
                            packetPackage = packetPackage.concat(packetArr);
                        }
                        // set checkbox for selected items
                    }
                }
            }
            replayedIndxs.push(packets[lineToSend.current].counter);
            lineToSend.current = packets[lineToSend.current].counter + 1;
        }

        setselectedIndexes(indxs => indxs.concat(replayedIndxs));
        replayDirection === 'toApp' && packetPackage.length > 0 ? socket.emit('replayPackets', packetPackage) : socket.emit('sendPacket', packetPackage);
    }

    const buildPackets = (packet: IPackets): number[][] | undefined => {
        if (includePacketTypes === packet.dir || includePacketTypes === 'both') {
            return packet.pkt.filter(p => p.length !== 0);
        }
        else return undefined
    }

    const handleReplayButton = () => {
        if (replayButtonText === 'Replay') {
            if (numPackets > 0 && lineToSend.current < numPackets) {
                setreplayButtonColor('success')
                setreplayButtonText('Replaying...');
                runToThisLine(lineToSend.current);
                replayTimer.current = setTimeout(handleReplayButton, replayspeed.current);
            }
            else {  
                resetReplayButton();
            }
        }
        else {
            resetReplayButton()
        }
    }
    const handleIncludeDirectionChange = (event) => {
        setreplayDirection(event.target.value);
    }
    const toggleIncludePacketTypes = () => {
        setincludePacketTypeDropDownOpen(dd => !dd);
    }
    const toggleDirectionDropDown = () => {
        setdirectionDropDownOpen(dir => !dir);
    }
    const handleIncludePacketTypes = (event) => {
        if (event.target.value === 'in') setincludePacketTypes('in')
        else if (event.target.value === 'out') setincludePacketTypes('out')
        else setincludePacketTypes(event.target.value)
    }
    const handleReplaySpeedChange = (event)=> {
        let ms = parseInt(event.target.value, 10);
        if (!isNaN(ms)) replayspeed.current = ms;
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
                        <Input value={`${lineToSend.current} of ${numPackets}`} readOnly />
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
                        {includePacketTypes === 'both' ? 'both ' : `Only ${includePacketTypes}`} packets
                        </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={handleIncludePacketTypes} value='in'>Only inbound</DropdownItem>
                        <DropdownItem onClick={handleIncludePacketTypes} value='out'>Only outbound</DropdownItem>
                        <DropdownItem onClick={handleIncludePacketTypes} value='both'>both</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown isOpen={directionDropDownOpen} toggle={toggleDirectionDropDown}>
                    <DropdownToggle caret color='primary' >
                        Replay to {replayDirection === 'toApp' ? 'App' : 'RS485'}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={handleIncludeDirectionChange} value='toApp'>App</DropdownItem>
                        <DropdownItem onClick={handleIncludeDirectionChange} value='toBus'>RS485</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Col>
                <label>
                    Replay Speed (ms)
                 <Input type='number' onChange={handleReplaySpeedChange} text={replayspeed.current} defaultValue={replayspeed.current}/>
                </label>
                </Col>
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