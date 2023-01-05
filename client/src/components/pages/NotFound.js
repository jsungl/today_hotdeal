import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {

    console.log('=========NotFound Component Rendering=========');

    return (
        <>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 64,
                position: 'absolute',
                width: '100%',
                height:'100%'
            }}>
                404
            </div>
        </>
    )
}