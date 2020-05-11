import { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
var extend=require("extend");

const dataFetchReducer=(state, action) => {
    console.log(`dataFetchReducer incoming:`)
    console.log(action)
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
            state.isLoading = false;
            state.isError = false;
            state.doneLoading = true;
            switch(action.updateType) {
                case 'REPLACE_ARRAY':
                    {
                        let index=state.data[action.dataName].findIndex(el => {
                            return el.id===action.data.id;
                        });
                        if(index===-1) state.data[action.dataName].push(action.data);
                        else state.data[action.dataName][index]=action.data;
                        return state;
                    }
                case 'MERGE_OBJECT':
                    {


                            console.log(`Merge (object):`);
                            console.log(action.data);
                            console.log(`to:`);
                            console.log(state.data[action.dataName]);
                            // Object.assign(state.data[action.dataName][index], action.data);
                            let res = extend(true, {}, state.data[action.dataName], action.data)
                            console.log(`result:`)
                            console.log(res)
                            console.log(`compare`)
                            console.log(state)
                            state.data[action.dataName] = res
                            console.log(state)
                            return {...state};
                    }
                case 'MERGE_ARRAY':
                    {
                        if (Array.isArray(action.dataName)){
                            console.log(`Merge Deep (array):`);
                            console.log(action.data);
                            console.log(`to:`);
                            let d = state.data;
                            for (let i=0; i<action.dataName.length; i++){
                                d = d[action.dataName[i]];
                            }
                            let index=d.findIndex(el => {
                                return el.id===action.data.id;
                            });

                            console.log(d[index]);
                            // Object.assign(state.data[action.dataName][index], action.data);
                            let res = extend(true, {}, d[index], action.data)
                            console.log(`result:`)
                            console.log(res)
                            console.log(`compare`)
                            console.log(state)
                            d[index] = res;
                            console.log(state)
                            return {...state};
                        }
                        else {
                        console.log(`state...`)
                        console.log(state)
                        let index=state.data[action.dataName].findIndex(el => {
                            return el.id===action.data.id;
                        });
                        console.log(`merge (array):`);
                        console.log(action.data);
                        console.log(`to:`);
                        console.log(state.data[action.dataName][index]);
                        // Object.assign(state.data[action.dataName][index], action.data);
                        let res = extend(true, {}, state.data[action.dataName][index], action.data)
                        state.data[action.dataName][index] = res;
                        console.log(`returning...`)
                        console.log(state)
                        return {...state};
                    }
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
        switch (action.updateType){
            case 'FETCH_FAILURE':
                dispatch({type:'FETCH_FAILURE'})
                break;
            default:
                dispatch({ type: 'UPDATE', ...action });
        }
    };

    useEffect(() => {
        const fetchData=async () => {
            dispatch({ type: 'FETCH_INIT' });
            try {
                let fetchArray=[];
                urls.forEach(el => {
                    console.log(`fetching: ${el.url}`)
                    fetchArray.push(axios(el.url));
                });
                if (fetchArray.length > 0){   
                    const res=await Promise.all(fetchArray);
                    let payload={};
                    for(let i=0;i<urls.length;i++) {
                        console.log(`obj for url: ${JSON.stringify(urls[i])}`)
                        console.log(res[i].data)
                        console.log(`object.entries: ${Object.entries(res[i].data)}`)
                        console.log(`object.keys: ${Object.keys(res[i].data)}`)
                        if (typeof urls[i].dataName === 'undefined'){
                            Object.assign(payload,res[i].data);
                        }
                        else {
                            payload[urls[i].dataName]=res[i].data;
                        }
                    }
                    dispatch({ type: 'FETCH_SUCCESS', payload });
                }
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