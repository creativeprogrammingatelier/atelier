import {Form} from "react-bootstrap";
import React, {useEffect, useState} from "react";

interface CheckboxInputProperties {
    name: string,
    value: string,
    selected?: boolean,
    disabled?: boolean,
    onChange: (state: boolean) => void
}

export function CheckboxInput({name, value, selected, disabled, onChange}: CheckboxInputProperties) {
    const [active, setActive] = useState(selected);

    const handleChange = () => {
        onChange(!active);
        setActive(!active);
    };

    useEffect(() => setActive(selected), [selected]);

    return <Form.Check custom id={value}>
        <Form.Check.Input
            value={value}
            checked={active}
            disabled={disabled}
            onChange={handleChange}
        />
        <Form.Check.Label htmlFor={value}>{name}</Form.Check.Label>
    </Form.Check>
}