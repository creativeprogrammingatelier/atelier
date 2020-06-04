import React, { useEffect } from "react";
import { ParentalProperties } from "../../helpers/ParentHelper";

export function Overlay({ children }: ParentalProperties) {
    useEffect(() => {
        document.body.classList.add("no-scroll");
        return () => document.body.classList.remove("no-scroll");
    }, [])

    return <div className="overlay">
        {children}
    </div>;
}