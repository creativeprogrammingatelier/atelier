import React, { useState, useEffect } from "react";
import { FeedItem } from "../../../../models/api/FeedItem";
import { FeedBlock } from "./FeedBlock";
import { usePersonalFeed, useCourseFeed, LoadMore, Refresh } from "../../helpers/api/APIHooks";
import { Cached } from "../general/loading/Cached";
import { IconType } from "react-icons";
import { Button } from "react-bootstrap";
import { FiFilter } from "react-icons/fi";
import { CheckboxInput } from "../input/CheckboxInput";
import { useObservable, pluckFirst } from "observable-hooks";
import { map } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { Announcement } from "../Announcement";

/**
 * Button for Switching Between Public and Private Feed
 *
 * @param icon The icon to appear next to the button text.
 * @param text The text of the button.
 * @param onClick Function to be called when button is pressed, via onClick event
 */
interface FeedButton {
    icon: IconType,
    text: string,
    onClick: () => void
}

/**
 * Properties used for differentiating feeds.
 */
interface FeedProperties {
    global: boolean,
    type: "personal" | "public",
    feed: Refresh<FeedItem> & LoadMore<FeedItem>,
    buttons: FeedButton[]
}

/**
 * Construct a Feed with the given FeedProperties. This functions takes in a FeedProperties then
 * retrieves the data from the cache, which conforms to the type and filters. It then packages this into
 * a Cached object and warps it in the 'm-3' class along with the feed buttons passed in.
 *
 * @param global Denotes whether feed is global or course specific.
 * @param type Denotes either private or public feed, used selecting which API path to call.
 * @param feed Feed of feed items that either support or do not support pagination, Refresh doesn't while LoadMore does.
 * @param buttons All feed buttons on the feed.
 */
function Feed({ feed, type, global, buttons }: FeedProperties) {
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [filtered, setFiltered] = useState(["submission", "mention", "commentThread"].concat(...(type === "personal" ? ["comment"] : [])));
    const [count, setCount] = useState(0);
    const filteredObservable = useObservable(pluckFirst, [filtered]);
    const filteredFeedObservable = useObservable(() =>
        combineLatest([feed.observable, filteredObservable]).pipe(
            map(([col, filtered]) =>
                "items" in col
                    ? { ...col, items: col.items.filter(item => filtered.includes(item.value.type)) }
                    : col
            ))
    );
    const filteredFeed = { ...feed, observable: filteredFeedObservable };

    useEffect(() => {
        const storedFilter = localStorage.getItem(`feedFilter#${type}`);
        if (storedFilter) setFiltered(JSON.parse(storedFilter));
    }, []);
    useEffect(() => {
        localStorage.setItem(`feedFilter#${type}`, JSON.stringify(filtered));
    }, [filtered]);

    return (
        <div className="m-3">
            <div className="feedButtons">
                <Button key="Filter" onClick={() => setFiltersExpanded(!filtersExpanded)}>
                    <FiFilter fill={filtered.length !== 4 ? "#ffffff" : "none"} /><span>Filter</span>
                </Button>
                {buttons.map(b => <Button key={b.text} onClick={b.onClick}>{b.icon({})}<span>{b.text}</span></Button>)}
            </div>
            {
                filtersExpanded &&
                <div className="feedFilters">
                    <FilterBox tag="submission" name="Submissions" filtered={filtered} setFiltered={setFiltered} />
                    <FilterBox tag="mention" name="Mentions" filtered={filtered} setFiltered={setFiltered} />
                    <FilterBox tag="commentThread" name="New comments" filtered={filtered} setFiltered={setFiltered} />
                    <FilterBox tag="comment" name="Replies" filtered={filtered} setFiltered={setFiltered} />
                </div>
            }
            <div>
                {count === 0 && <Announcement msg="No Submissions Yet"/>}
            </div>
            <Cached cache={filteredFeed} extractDate={item => new Date(item.timestamp)} updateCount={setCount}>
                {item => <FeedBlock key={item.ID} data={item} isGlobal={global} />}
            </Cached>
        </div>
    );
}

/**
 * Interface declaring the properties of the personal feed.
 */
interface PersonalFeedProperties { courseID?: string, buttons?: FeedButton[] }
/**
 * Retrieves the personal feed for a specific course and returns a Feed component
 * consisting of the feed items associated with the given feed.
 *
 * @param courseID String representation of the course ID in string form.
 * @param buttons FeedButtons preserving their properties, like filtration tags.
 */
export function PersonalFeed({ courseID, buttons = [] }: PersonalFeedProperties) {
    const feed = usePersonalFeed(courseID);
    return (<Feed feed={feed} type="personal" buttons={buttons} global={courseID === undefined} />);
}

/**
 * Interface defining the properties for a course feed.
 */
interface CourseFeedProperties { courseID: string, buttons?: FeedButton[] }
/**
 * Retrieves a given course feed given the CourseFeedProperties.
 */
export function CourseFeed({ courseID, buttons = [] }: CourseFeedProperties) {
    const feed = useCourseFeed(courseID);
    return (<Feed feed={feed} type="public" buttons={buttons} global={false} />);
}

/**
 * Interface defining the properties of the filter box.

 */
interface FilterBoxProperties {
    tag: string,
    name: string,
    filtered: string[],
    setFiltered: (update: (filtered: string[]) => string[]) => void
}
/**
 *  Function that calls the FilterBox with the given FilterBoxProperties
 *
 * @param tag Tag used for filtering.
 * @param name Name of filtering option.
 * @param filtered Filtered feed.
 * @param setFiltered Function to update the filtered objects.
 */
function FilterBox({ tag, name, filtered, setFiltered }: FilterBoxProperties) {
    return (
        <CheckboxInput
            key={tag}
            value={tag}
            selected={filtered.includes(tag)}
            onChange={state => {
                state
                    ? setFiltered(filtered => filtered.concat(tag))
                    : setFiltered(filtered => filtered.filter(f => f !== tag));
            }}>
            {name}
        </CheckboxInput>
    );
}
