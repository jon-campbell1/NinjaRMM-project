import React from 'react';
import { formatDeviceType } from '../../helpers';
import './device.scss';

const Device = function ({ 
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
                    <button onClick={editAction}>Edit</button> - <button onClick={deleteAction}>Delete</button>
                </div>
            </div>
         </div>
    );
}

export default Device;