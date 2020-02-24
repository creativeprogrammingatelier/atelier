import React, {useState} from 'react';

interface InputFieldProps {
    buttonText? : string,
    callBack : (value : string) => void
}

export function InputField({callBack, buttonText=""} : InputFieldProps) {
    const [value, setValue] = useState("");

    const handleSubmit = (event: React.FormEvent) => {
        if (value !== null && value.trim() !== "") {
            callBack(value);
        }
        event.preventDefault();
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
            />
            <button className="btn">
                {buttonText}
            </button>
        </form>
    )
}