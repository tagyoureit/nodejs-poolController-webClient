import { Button, Card, CardText, CardGroup, CardBody, CardTitle, CardFooter } from 'reactstrap';
import { useAPI } from './Comms'
import * as React from 'react';
import { PoolContext } from './PoolController';
interface Props {
    name: string;
    id: string;
    edit?: () => void
    children: any
}
function CustomCard(props: Props) {

    const execute=useAPI();

    const handleClick= async (name: string) => {
        await execute('panelVisibility', { name, state: 'hide' });
    }
    const editButton=() => (<Button size="sm" className="mr-3" color="primary" style={{ float: 'right' }} onClick={props.edit}>Edit</Button>)
    return (
        <PoolContext.Consumer>
            {({ visibility, reload }) => (
                <div>
                    {!visibility.includes(props.name)?
                        <Card className=" border-primary">
                            <CardBody className="p-0">
                                <CardTitle className='card-header bg-primary text-white' >
                                    {props.name}
                                    <div style={{ float: 'right' }}>
                                        <Button size="sm" className="mr-3" color="primary" style={{ float: 'right' }} onClick={() => { handleClick(props.name); reload(); }} value={props.id}>Hide</Button>
                                        {props.edit!==undefined? editButton():''}
                                    </div>

                                </CardTitle>

                                <CardText tag='div' className="p-3">

                                    {props.children}

                                </CardText>

                            </CardBody>

                        </Card>
                        :<></>}
                </div>
            )}
        </PoolContext.Consumer>
    )
}

export default CustomCard;