import React from 'react';
import {
    map,
    addIndex,
} from 'ramda';
import {getValue} from './helpers';
const mapWithKey = addIndex(map);

const isOptionsGrouped = (options, optionValue) => options && options.length > 0 && Array.isArray(getValue(optionValue, options[0]));

const mapOptions = ({options, optionValue, optionLabel}) =>
    mapWithKey((o, idx) =>
        <option
            key={idx}
            value={getValue(optionValue, o)}>{getValue(optionLabel, o)}
        </option>,
        options);

const mapGroups = ({options, optionValue, optionLabel}) =>
    mapWithKey((o, idx) =>
            <optgroup
                label={getValue(optionLabel, o)}
                key={idx}>
                {mapOptions({options: getValue(optionValue, o), optionValue, optionLabel})}
            </optgroup>,
        options);

const SelectInput = ({id, disabled, inputRef, options, title, value, onChange, optionValue, optionLabel}) =>
    <select id={id} disabled={disabled} ref={inputRef} className="form-control" placeholder={title} value={value || ""}
            onChange={e => onChange(e.target.value)}>
        {
            isOptionsGrouped(options, optionValue)
                ? mapGroups({options, optionValue, optionLabel})
                : mapOptions({options, optionValue, optionLabel})
        }
    </select>;

export default SelectInput;
