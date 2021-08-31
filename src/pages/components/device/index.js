import React from 'react';
import { formatDeviceType } from '../../helpers';
import './device.scss';

export default function ({ 
    deviceDetails,  
    deleteAction,
    editAction,
}) {
    const { system_name, type, hdd_capacity} = deviceDetails;

    return (
        <div className='part-row'>
            <div>
                <div className='part-name'>{system_name}</div>
                <div className='part-price'>{formatDeviceType(type)}</div>
                <div className='part-description'>{hdd_capacity || 0} GB</div>
                <div className='part-links'>
                    <a href='#' onClick={editAction}>Edit</a> - <a href='#' onClick={deleteAction}>Delete</a>
                </div>
            </div>
         </div>
    );
}