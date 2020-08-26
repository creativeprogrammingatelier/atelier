import React from "react";
import { FeedItem } from "../../../../models/api/FeedItem";
import { FeedBlock } from "./FeedBlock";
import { usePersonalFeed, useCourseFeed, LoadMore, Refresh } from "../../helpers/api/APIHooks";
import { Cached } from "../general/loading/Cached";

function Feed({ feed }: { feed: Refresh<FeedItem> & LoadMore<FeedItem> }) {
    return (
        <Cached cache={feed} extractDate={item => new Date(item.timestamp)}>
            {item => <FeedBlock key={item.ID} data={item} />}
        </Cached>
    );
}

export function PersonalFeed({ courseID }: { courseID?: string }) {
    const feed = usePersonalFeed(courseID);
    return (<Feed feed={feed} />);
}

export function CourseFeed({ courseID }: { courseID: string }) {
    const feed = useCourseFeed(courseID);
    return (<Feed feed={feed} />);
}