import React, { useEffect, useState, createContext, useContext } from "react";
import { ParentalProperties } from "../../helpers/ParentHelper";

const timeContext = createContext(new Date());

export function TimeProvider({ children }: ParentalProperties) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
		const handle = setInterval(() => {
			setCurrentTime(new Date())
        }, 1000);
        return () => clearInterval(handle);
    }, []);
    
    return <timeContext.Provider value={currentTime} children={children} />;
}

export function useTime() {
    return useContext(timeContext);
}