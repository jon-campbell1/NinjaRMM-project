import React from 'react';
import './modal.scss';

export default function({
    onClose,
    title,
    form,
    onSave,
    errors,
}) {
    return (
        <div className='modal-container'>
            <div className='modal-contents'>
                <div className='modal-close' onClick={onClose}>X</div>
                <h3>{title}</h3>
                <div className='modal-form'>
                     {form}
                </div>
                <div className='errors'>
                    {errors && errors.join(' ')}
                </div>
                <div className='modal-buttons'>
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={onSave}>Confirm</button>
                </div>
            </div>
        </div>
    )
}