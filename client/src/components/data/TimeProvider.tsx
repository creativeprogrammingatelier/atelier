import React, {useEffect, useState, createContext, useContext} from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";

const timeContext = createContext(new Date());

/**
 * Component used to provide the current time to any children component.
 */
export function TimeProvider({children}: ParentalProperties) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const handle = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(handle);
    }, []);
    return (
        <timeContext.Provider value={currentTime}>
            {children}
        </timeContext.Provider>
    );
}

/**
 * Passes the timeContext constant to the useContext hook.
 */
export function useTime() {
    return useContext(timeContext);
}
