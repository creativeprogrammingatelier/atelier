import React from "react";
import { FeedItem } from "../../../../models/api/FeedItem";
import { FeedBlock } from "./FeedBlock";
import { usePersonalFeed, useCourseFeed, LoadMore, Refresh } from "../../helpers/api/APIHooks";
import { Cached } from "../general/loading/Cached";
import { IconType } from "react-icons";
import { Button } from "react-bootstrap";
import { FiFilter } from "react-icons/fi";

interface FeedButton {
    icon: IconType, 
    text: string, 
    onClick: () => void 
}

interface FeedProperties {
    global: boolean,
    feed: Refresh<FeedItem> & LoadMore<FeedItem>,
    buttons: FeedButton[]
}

function Feed({ feed, global, buttons }: FeedProperties) {
    return (
        <div className="m-3">
            <div className="feedButtons">
                <Button><FiFilter /><span>Filter</span></Button>
                {buttons.map(b => <Button onClick={b.onClick}>{b.icon({})}<span>{b.text}</span></Button>)}
            </div>
            <Cached cache={feed} extractDate={item => new Date(item.timestamp)}>
                {item => <FeedBlock key={item.ID} data={item} global={global} />}
            </Cached>
        </div>
    );
}

interface PersonalFeedProperties { courseID?: string, buttons?: FeedButton[] }
export function PersonalFeed({ courseID, buttons = [] }: PersonalFeedProperties) {
    const feed = usePersonalFeed(courseID);
    return (<Feed feed={feed} buttons={buttons} global={courseID === undefined} />);
}

interface CourseFeedProperties { courseID: string, buttons?: FeedButton[] }
export function CourseFeed({ courseID, buttons = [] }: CourseFeedProperties) {
    const feed = useCourseFeed(courseID);
    return (<Feed feed={feed} buttons={buttons} global={false} />);
}