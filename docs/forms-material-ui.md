---
id: forms-simple
title: Simple Form
---

<iframe src="https://codesandbox.io/embed/zlmzlpwz6l" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

```javascript
import React from "react";
import { Form } from "k-forms";
import fieldTypes from "./fieldTypes";

const sexOptions = ["male", "female"];
const colorOptions = ["", "Red", "Green", "Blue"];

const schema = [
  {
    id: "firstName",
    title: "First Name"
  },
  {
    id: "lastName",
    title: "Last Name"
  },
  {
    id: "email",
    title: "Email",
    type: "email"
  },
  {
    id: "sex",
    title: "Sex",
    type: "radio",
    props: () => ({ options: sexOptions })
  },
  {
    id: "favColor",
    title: "Favorite Color",
    type: "select",
    props: () => ({ options: colorOptions })
  },
  {
    id: "employed",
    title: "Employed",
    type: "checkbox"
  },
  {
    id: "notes",
    title: "Notes",
    type: "textarea"
  }
];

const SimpleForm = () => {
  return (
    <Form
      scope="form"
      schema={schema}
      fieldTypes={fieldTypes}
      onSubmit={(validate, fields) => alert(JSON.stringify(fields, null, 2))}
    />
  );
};

```

# Material UI Form {#material-ui}

{% codesandbox %}
https://codesandbox.io/embed/614822vpqz?hidenavigation=1&view=preview
{% endcodesandbox %}

