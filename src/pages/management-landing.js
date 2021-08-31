import React, { useEffect, useState } from 'react';
import { MultiSelect } from "react-multi-select-component";
import Modal from './components/modal';
import Device from './components/device';
import './management-landing.scss';

import ApiService from '../api-service';

export default function() {

    const [devices, updateDevices] = useState([]);
    const [allDevices, updateAllDevices] = useState([]);
    const [devicesLoaded, updateDevicesLoaded] = useState(false);
    const [showAddModal, updateShowAddModal] = useState(false);
    const [showDeleteModal, updateShowDeleteModal] = useState(false);
    const [currentDevice, updateCurrentDevice] = useState({});
    const [filters, setFilters] = useState([]);
    const [errors, updateErrors] = useState([]);

    useEffect(() => {
        if (!devicesLoaded) {
            ApiService.getDevices()
            .then(devices => {
                updateDevices(devices);
                updateAllDevices(devices);
                updateDevicesLoaded(true);
            })
            .catch(() => {
                updateDevicesLoaded(true);
            });
        }
    }, devicesLoaded);

    const editInventory = device => {
        updateCurrentDevice(device);
        updateShowAddModal(true);
    }

    const openDeleteModal = device => {
        updateCurrentDevice(device);
        updateShowDeleteModal(true);
    }

    const setCurrentDevice = e => {
        const newCurrentDevice = {...currentDevice, [e.target.id]: e.target.value};
        updateCurrentDevice(newCurrentDevice);
    }

    const clearModalForm = () => {
        updateShowAddModal(false); 
        updateShowDeleteModal(false);
        updateCurrentDevice({});
        updateErrors([]);
    }

    const saveDevice = () => {
        const errors = [];
        ['Type', 'System Name', 'HDD Capacity'].forEach(property => {
            if (!currentDevice[property.toLowerCase().replace(/ /g, '_')]) {
                errors.push(`${property} is required.`)
            }
        })
        if (errors.length) {
            updateErrors(errors);
            return;
        }
        const route = !currentDevice.id ? 'create' : 'update';
        ApiService[`${route}Device`](currentDevice).then(res => {
            if (!currentDevice.id) {
                updateDevices([...devices, res]);
                clearModalForm();
                return;
            }
            mapUpdateToDevice();
        });
    }

    const deleteDevice = () => {
        ApiService.deleteDevice(currentDevice).then(res => {
            const currentdevices = devices;
            currentdevices.forEach((part, ind) => {
                if (part.id ===  currentDevice.id) {
                    currentdevices.splice(ind, 1);
                }
            });
            updateDevices(currentdevices);
            clearModalForm();
        });
    }

    const mapUpdateToDevice = () => {
        const currentdevices = devices;
        currentdevices.forEach((part, ind) => {
            if (part.id === currentDevice.id) {
                currentdevices[ind] = currentDevice;
            }
        });
        updateDevices(currentdevices);
        clearModalForm();
    }

    const filterDevices = filters => {
        if (!filters.length) {
            setFilters([]);
            updateDevices(allDevices);
            return;
        }

        setFilters(filters)
        updateDevices(allDevices.filter(device => filters.map(filter => filter.value).includes(device.type)));
        
    }

    const sortDevices = e => {
        const val = e.target.value;

        if (!val) {
            updateDevices(allDevices);
            return;
        }

        const sortedDevices = allDevices.sort((a, b) => (a[val] > b[val]) ? 1 : -1);
        console.log(sortedDevices);
        updateDevices([...sortedDevices]);
    }
    
    const inventoryForm = 
        <>
            <div className='input-container'>
              <input 
                type='text'  
                placeholder='Name' 
                id='system_name' 
                value={currentDevice.system_name} 
                onChange={setCurrentDevice}
                />
            </div>
            <div className='input-container'>
              <select value={currentDevice.type} id='type' onChange={setCurrentDevice}>
                  <option value=''>Type</option>
                  <option value='WINDOWS_WORKSTATION'>Windows WorkStation</option>
                  <option value='MAC'>Mac</option>
                  <option value='WINDOWS_SERVER'>Windows Server</option>
              </select>
            </div>
            <div className='input-container'>
              <input 
                type='number' 
                placeholder='HDD Capacity (GB)' 
                step='.01' 
                id='hdd_capacity' 
                value={currentDevice.hdd_capacity} 
                onChange={setCurrentDevice}
                />
            </div>
        </>

    const renderDevices = () =>
        devices.map(device => 
            <Device
                deviceDetails={device}
                editAction={() => { editInventory(device) }}
                deleteAction={() => { openDeleteModal(device) }}
            />
        )

    return  (
        <div className='devices-list'>

            {
                showAddModal && 
                <Modal 
                    onClose={clearModalForm}
                    onSave={() => { saveDevice() }}
                    errors={errors}
                    title={currentDevice.id ? 'Edit Device' : 'Add Device'}
                    form={inventoryForm}
                />
            }

            {
                showDeleteModal && 
                <Modal 
                    onClose={clearModalForm}
                    onSave={() => { deleteDevice() }}
                    title={`Are you sure you want to delete device ${currentDevice.system_name}?`}
                />
            }


            <h1>Device Management</h1>
            <button className='add-btn' onClick={() => {updateShowAddModal(true)}}>Add Device</button>
            <div className='filter-container'>
                <div className='filter'>
                    Device Type:
                    <MultiSelect
                        options={[
                            {label: 'Windows WorkStation', value: 'WINDOWS_WORKSTATION'},
                            {label: 'Mac', value: 'MAC'},
                            {label: 'Windows Server', value: 'WINDOWS_SERVER'}
                        ]}
                        value={filters}
                        onChange={filterDevices}
                        placeholder="Device Type"
                    />
                </div>

                <div className='filter'>
                    Sort By:
                    <div>
                        <select onChange={sortDevices}>
                            <option value=''>None</option>
                            <option value='system_name'>System Name</option>
                            <option value='type'>Type</option>
                            <option value='hdd_capacity'>HDD Capacity</option>
                        </select>
                    </div>
                </div>
            </div>
            {renderDevices()}
        </div>
    )

}
