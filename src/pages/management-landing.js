import React, { useEffect, useState } from 'react';
import { MultiSelect } from "react-multi-select-component";
import Modal from './components/modal';
import Device from './components/device';
import './management-landing.scss';

import ApiService from '../api-service';

const ManagementLanding = function() {

    const [devices, updateDevices] = useState([]);
    const [allDevices, updateAllDevices] = useState([]);
    const [devicesLoaded, updateDevicesLoaded] = useState(false);

    const [modals, updateModals] = useState({
        showAddModal: false,
        showDeleteModal: false
    });
    
    const [currentDevice, updateCurrentDevice] = useState({});
    const [filters, setFilters] = useState([]);
    const [currentSort, setCurrentSort] = useState('');
    const [errors, updateErrors] = useState([]);

    useEffect(() => {
        if (!devicesLoaded) {
            getDevices();
        }
    }, [devicesLoaded]);


    const getDevices = () => {
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

    const editInventory = device => {
        updateCurrentDevice(device);
        updateModals({
            ...modals,
            showAddModal: true
        })
    }

    const openDeleteModal = device => {
        updateCurrentDevice(device);
        updateModals({
            ...modals,
            showDeleteModal: true
        })
    }

    const setCurrentDevice = e => {
        const newCurrentDevice = {...currentDevice, [e.target.id]: e.target.value};
        updateCurrentDevice(newCurrentDevice);
    }

    const clearModalForm = () => {
        updateModals({
            showAddModal: false,
            showDeleteModal: false,
        })
        updateCurrentDevice({});
        updateErrors([]);
    }

    const saveDevice = () => {
        const errors = [];
        ['Type', 'System Name', 'HDD Capacity'].forEach(property => {
            const deviceProperty = currentDevice[property.toLowerCase().replace(/ /g, '_')];
            if (!deviceProperty) {
                errors.push(`${property} is required.`);
            }
            if (property === 'HDD Capacity') {
                if (deviceProperty <= 0) {
                    errors.push(`${property} must be greater than 0.`);
                }
            }
        })
        if (errors.length) {
            updateErrors(errors);
            return;
        }
        const route = !currentDevice.id ? 'create' : 'update';
        ApiService[`${route}Device`](currentDevice).then(res => {
            if (!currentDevice.id) {
                updateDevices((currentDevices) => {
                    let newDevices = [...currentDevices, res];
                    if (currentSort) {
                        newDevices = getSortedDevices(newDevices);
                    }
                    return newDevices;
                });
                clearModalForm();
                return;
            }
            mapUpdateToDevice();
        });
    }

    const getSortedDevices = (devices) => 
        devices.sort((a, b) => {
            const aValue = currentSort === 'hdd_capacity' ? Number(a[currentSort]) : a[currentSort];
            const bValue = currentSort === 'hdd_capacity' ? Number(b[currentSort]) : b[currentSort];

            return (aValue > bValue) ? 1 : -1;
        });
    

    const deleteDevice = () => {
        ApiService.deleteDevice(currentDevice).then(res => {
            const currentdevices = devices;
            currentdevices.forEach((device, ind) => {
                if (device.id ===  currentDevice.id) {
                    currentdevices.splice(ind, 1);
                }
            });
            updateDevices(currentdevices);
            clearModalForm();
        });
    }

    const mapUpdateToDevice = () => {
        const currentdevices = devices;
        currentdevices.forEach((device, ind) => {
            if (device.id === currentDevice.id) {
                currentdevices[ind] = currentDevice;
            }
        });
        updateDevices((currentDevices) => {
            let newDevices = currentDevices;
            if (currentSort) {
                newDevices = getSortedDevices(newDevices);
            }
            return newDevices;
        });
        clearModalForm();
    }

    const filterDevices = (filters, sort = '') => {
        setFilters(filters);

        let sortedDevices = allDevices;
        const sortProp = sort || currentSort;
        if (sortProp) {
            sortedDevices = allDevices.sort((a, b) => {

                const aValue = sortProp === 'hdd_capacity' ? Number(a[sortProp]) : a[sortProp];
                const bValue = sortProp === 'hdd_capacity' ? Number(b[sortProp]) : b[sortProp];

                return (aValue > bValue) ? 1 : -1;
            }
            );
        }

        if (!filters.length) {
            setFilters([]);
            updateDevices(sortedDevices);
            return;
        }
        updateDevices(sortedDevices.filter(device => filters.map(filter => filter.value).includes(device.type)));
    }

    const sortDevices = e => {
        const val = e.target.value;
        setCurrentSort(val);
        filterDevices(filters, val);
    }
    
    const inventoryForm = 
        <>
            <div className='input-container'>
              <input 
                type='text'  
                placeholder='Name' 
                id='system_name' 
                onChange={setCurrentDevice}
                />
            </div>
            <div className='input-container'>
              <select id='type' onChange={setCurrentDevice}>
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
                onChange={setCurrentDevice}
                />
            </div>
        </>

    const renderDevices = () =>
        devices.map((device) => 
            <Device
                key={`device-${device.id}`}
                deviceDetails={device}
                editAction={() => { editInventory(device) }}
                deleteAction={() => { openDeleteModal(device) }}
            />
        )

    return  (
        <div className='devices-list'>

            {
                modals.showAddModal && 
                <Modal 
                    onClose={clearModalForm}
                    onSave={() => { saveDevice() }}
                    errors={errors}
                    title={currentDevice.id ? 'Edit Device' : 'Add Device'}
                    form={inventoryForm}
                />
            }

            {
                modals.showDeleteModal && 
                <Modal 
                    onClose={clearModalForm}
                    onSave={() => { deleteDevice() }}
                    title={`Are you sure you want to delete device ${currentDevice.system_name}?`}
                />
            }


            <h1>Device Management</h1>
            <button className='add-btn' onClick={() => {updateModals({...modals, showAddModal: true})}}>Add Device</button>
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
                            <option value=''>Choose an option</option>
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

export default ManagementLanding;
