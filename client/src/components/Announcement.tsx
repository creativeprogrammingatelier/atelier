import React from "react";

import "../styles/announce.scss";

interface AnnouncementProperties {
    /** Message to be displayed by announcement. */
    msg: string
}

/** Announcement component used to display messages in 
 *  a stylized way on the page, rather then using paragraphs.
 */
export function Announcement({msg}: AnnouncementProperties) {
    return (
        <div className="announcement">
            <h5 className="announce-message"><em>{msg}</em></h5>
        </div>
    );
}