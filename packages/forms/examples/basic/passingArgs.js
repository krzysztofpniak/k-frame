import React, {memo, useCallback, useEffect, useState} from 'react';
import {Form} from '../../src/main';
import fieldTypes from '../common/fieldTypes';
import {FormTemplate, Row, useSubmitAlert} from '../common';

const parseIntNull = v => {
  const parsed = parseInt(v, 10);
  return isNaN(parsed) ? null : parsed;
};

const countries = [
  {
    code: 'us',
    name: 'USA',
  },
  {
    code: 'pl',
    name: 'Polska',
  },
];

const cities = [
  {
    country: 'us',
    name: 'New York',
  },
  {
    country: 'us',
    name: 'Los Angeles',
  },
  {
    country: 'pl',
    name: 'Warszawa',
  },
  {
    country: 'pl',
    name: 'Wrocław',
  },
];

const schema = [
  {id: 'name', title: 'ConnectionName'},
  {
    id: 'country',
    defaultValue: 'pl',
    title: 'Country',
    type: 'select',
    props: () => ({options: countries, valueKey: 'code', labelKey: 'name'}),
    onChange: (value, {args: {loadCities}, setFields}) => {
      loadCities(value);
      setFields({city: ''});
    },
  },
  {
    id: 'city',
    title: 'City',
    type: 'select',
    props: ({
      args: {
        availableCities: {data, pending},
      },
    }) => ({
      options: data,
      valueKey: 'name',
      labelKey: 'name',
      pending,
    }),
  },
];

const getCitiesMock = countryCode =>
  new Promise(resolve =>
    setTimeout(
      () => resolve(cities.filter(c => c.country === countryCode)),
      2000
    )
  );

const App = () => {
  const handleSubmit = useSubmitAlert();
  const [availableCities, setAvailableCities] = useState({
    pending: true,
    data: [],
  });

  const loadCities = useCallback(countryCode => {
    setAvailableCities({pending: true, data: []});
    getCitiesMock(countryCode).then(cities =>
      setAvailableCities({pending: false, data: cities})
    );
  }, []);

  useEffect(() => {
    loadCities('pl');
  }, []);

  return (
    <Form
      scope="form"
      schema={schema}
      fieldTypes={fieldTypes}
      fieldTemplate={Row}
      formTemplate={FormTemplate}
      onSubmit={handleSubmit}
      args={{
        availableCities,
        loadCities,
      }}
    />
  );
};

export default App;
