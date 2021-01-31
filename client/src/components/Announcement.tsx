import React from "react";

import "../styles/announce.scss"

interface AnnouncementProperties {
    msg: string
}

export function Announcement({msg}: AnnouncementProperties) {
    return (
        <div className="announcement">
            <h5 className="announce-message"><em>{msg}</em></h5>
        </div>
    );
}