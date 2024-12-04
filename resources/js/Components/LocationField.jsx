import React from 'react';
import { Field } from 'formik';
import Select from 'react-select'
import AsyncSelect from 'react-select/async';
import { Label } from 'flowbite-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const LocationField = ({ id, name, type, placeholder, label, value, onChange, className, error, selected, isClearAllowed = false }) => {
    const [inputValue, setInputValue] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);
    const [station, setStation] = useState(null);

    const promiseOptions = async (search) => {
        if (search.length > 0) {
            let stations = await axios.get(route('stations-search', { search: search }))
                .then((response) => {
                    const formattedStations = [];
                    console.log(response.data);
                    if (response.data.length > 0) {
                        for (const station of response.data) {
                            formattedStations.push({
                                label: station.name + " (" + station.short_name + ")",
                                value: station.id,
                                short_name: station.short_name
                            });
                        }
                    }
                    return formattedStations;
                });
            return stations;
        } else {
            return [];
        }
    }
    const handleClear = (e) => {
        e.preventDefault();
        setStation(null);
        setInputValue('');
        onChange(null);
    }

    const handleInputChange = (newValue) => {
        setInputValue(newValue);
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setTimeoutId(setTimeout(() => {
            promiseOptions(inputValue);
        }, 1000));
    };

    useEffect(() => {
        if (selected) {
            axios.get(route('stations.show', { id: selected })).then((response) => {
                setStation({ label: response.data.name + " (" + response.data.short_name + ")", value: response.data.id, short_name: response.data.short_name });
            });
        }
    }, [selected]);

    return (
        <>
            <Label className="flex justify-start ">
                {label}
            </Label>
            <span className="text-xs text-gray-500">*Sie können schreiben</span>
            

            <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={promiseOptions}
                onInputChange={handleInputChange}
                loadingMessage={() => 'Daten werden vom Server abgerufen, bitte warten...'}
                noOptionsMessage={() => 'Keine Optionen gefunden'}
                placeholder={placeholder}
                value={station ? station : value}
                
                onChange={(selectedOption) => {
                    console.log(selectedOption);
                    onChange(selectedOption);
                }}
                menuPortalTarget={document.body} // Chrome tarayıcılarda sayfa kilitlenmesini önlemek için eklendi
            />
            {isClearAllowed &&
                <div className="relative" style={{top: '-34px'}}>
                    <button className="text-red-600 border border-red-600 rounded-md px-2 py-1 hover:bg-red-600 hover:text-white ml-5 absolute right-10" style={{top: '-5px'}} onClick={handleClear}>Löschen</button>
                </div>
            }
        
            
        </>
    );
};

export default LocationField;