import React from 'react';
import { Field } from 'formik';
import Select from 'react-select'
import AsyncSelect from 'react-select/async';
import { Label } from 'flowbite-react';
import { useState, useEffect } from 'react';
import axios from 'axios';



const LocationField = ({ id,name,type,placeholder,label, value, onChange, className,error }) => {
    const [inputValue, setInputValue] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);

    const promiseOptions = async (search) =>{        
        if(search.length > 0){
            let stations = await axios.get(route('stations-search', {search: search}))
                .then((response) => {
                    const formattedStations = [];
                    for(const station of response.data){
                        formattedStations.push({
                            label: station.name + " (" + station.short_name + ")",
                            value: station.id,
                            short_name: station.short_name
                        });
                    }
                    return formattedStations;
                });
            return stations;
        } else  {
            return [];
        }
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
            value={value}
            onChange={onChange}
            menuPortalTarget={document.body} // Chrome tarayıcılarda sayfa kilitlenmesini önlemek için eklendi
        />
        

        {/*<div>
            <label htmlFor="location">{label}</label>
            <Field
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange} 
                className={className}
            />
            {error && <p className="text-red-500">{error}</p>}
        </div>

        */}
        </>
    );
};

export default LocationField;