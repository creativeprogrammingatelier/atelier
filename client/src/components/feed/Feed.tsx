import React from "react";
import { FeedItem } from "../../../../models/api/FeedItem";
import { FeedBlock } from "./FeedBlock";
import { usePersonalFeed, useCourseFeed, LoadMore, Refresh } from "../../helpers/api/APIHooks";
import { Cached } from "../general/loading/Cached";

interface FeedProperties {
    global: boolean,
    feed: Refresh<FeedItem> & LoadMore<FeedItem>
}

function Feed({ feed, global }: FeedProperties) {
    return (
        <div className="m-3">
            <Cached cache={feed} extractDate={item => new Date(item.timestamp)}>
                {item => <FeedBlock key={item.ID} data={item} global={global} />}
            </Cached>
        </div>
    );
}

export function PersonalFeed({ courseID }: { courseID?: string }) {
    const feed = usePersonalFeed(courseID);
    return (<Feed feed={feed} global={courseID === undefined} />);
}

export function CourseFeed({ courseID }: { courseID: string }) {
    const feed = useCourseFeed(courseID);
    return (<Feed feed={feed} global={false} />);
}