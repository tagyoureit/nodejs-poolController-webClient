import { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
var extend=require("extend");

const dataFetchReducer=(state, action) => {
    switch(action.type) {
        case 'FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
                doneLoading: false
            };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
                doneLoading: true
            };
        case 'FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
                doneLoading: false
            };
        case 'UPDATE':
            switch(action.updateType) {
                case 'REPLACE':
                    {
                        let index=state.data[action.dataName].findIndex(el => {
                            return el.id===action.data.id;
                        });
                        if(index===-1) state.data[action.dataName].push(action.data);
                        else state.data[action.dataName][index]=action.data;
                        return state;
                    }
                case 'MERGE_ARRAY':
                    {
                        console.log(`Merge (array):`);
                        console.log(action.data);
                        console.log(`to:`);
                        console.log(state.data[action.dataName]);
                        // Object.assign(state.data[action.dataName][index], action.data);
                        extend(true, state.data[action.dataName], action.data)
                        return {
                            ...state
                        };
                    }
                case 'MERGE_OBJECT':
                    {
                        let index=state.data[action.dataName].findIndex(el => {
                            return el.id===action.data.id;
                        });
                        console.log(`merge (object):`);
                        console.log(action.data);
                        console.log(`to:`);
                        console.log(state.data[action.dataName][index]);
                        // Object.assign(state.data[action.dataName][index], action.data);
                        extend(true, state.data[action.dataName][index], action.data)
                        return {
                            ...state
                        };
                    }
                case 'EXTEND':
                    console.log(`type of update=extend; with data: ${ JSON.stringify(action.data) }`);
                    break;

                default:
                    throw new Error(`Missing action.updateType ${ action.updateType }`);
            }
            break;
        default:
            throw new Error(`Missing action.type ${ action.type }`);
    }
};
const useDataApi=(initialUrls, initialData) => {
    const [urls, setUrls]=useState(initialUrls);

    const [state, dispatch]=useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        doneLoading: false,
        data: initialData
    });

    const setUpdates=(action: { updateType: string, data: any; }) => {
        dispatch({ type: 'UPDATE', ...action });
    };

    useEffect(() => {
        const fetchData=async () => {
            dispatch({ type: 'FETCH_INIT' });
            try {
                let fetchArray=[];
                urls.forEach(el => {
                    fetchArray.push(axios(el.url));
                });
                const res=await Promise.all(fetchArray);
                let payload={};
                for(let i=0;i<urls.length;i++) {
                    payload[urls[i].name]=res[i].data;
                }
                dispatch({ type: 'FETCH_SUCCESS', payload });
            }
            catch(error) {
                console.log(error);
                dispatch({ type: 'FETCH_FAILURE' });
            }
        };
        fetchData();
    }, [urls]);



    return [state, setUrls, setUpdates];
};

export default useDataApi;