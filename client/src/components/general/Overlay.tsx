import React, { useEffect } from "react";
import { ParentalProperties } from "../../helpers/ParentHelper";

/**
 * Component for creating overlays with the children passed being wrapper by the Overlay.
 */
export function Overlay({ children }: ParentalProperties) {
    useEffect(() => {
        document.body.classList.add("no-scroll");
        return () => document.body.classList.remove("no-scroll");
    }, []);

    return <div className="overlay">
        {children}
    </div>;
}
