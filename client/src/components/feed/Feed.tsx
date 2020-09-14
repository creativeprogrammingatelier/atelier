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

interface FeedButton {
    icon: IconType, 
    text: string, 
    onClick: () => void 
}

interface FeedProperties {
    global: boolean,
    type: "personal" | "public",
    feed: Refresh<FeedItem> & LoadMore<FeedItem>,
    buttons: FeedButton[]
}

function Feed({ feed, type, global, buttons }: FeedProperties) {
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [filtered, setFiltered] = useState([ "submission", "mention", "commentThread" ].concat(...(type === "personal" ? [ "comment" ] : [])));
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
    }, [])
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
            <Cached cache={filteredFeed} extractDate={item => new Date(item.timestamp)}>
                {item => <FeedBlock key={item.ID} data={item} global={global} />}
            </Cached>
        </div>
    );
}

interface PersonalFeedProperties { courseID?: string, buttons?: FeedButton[] }
export function PersonalFeed({ courseID, buttons = [] }: PersonalFeedProperties) {
    const feed = usePersonalFeed(courseID);
    return (<Feed feed={feed} type="personal" buttons={buttons} global={courseID === undefined} />);
}

interface CourseFeedProperties { courseID: string, buttons?: FeedButton[] }
export function CourseFeed({ courseID, buttons = [] }: CourseFeedProperties) {
    const feed = useCourseFeed(courseID);
    return (<Feed feed={feed} type="public" buttons={buttons} global={false} />);
}

interface FilterBoxProperties {
    tag: string,
    name: string,
    filtered: string[],
    setFiltered: (update: (filtered: string[]) => string[]) => void
}
function FilterBox({ tag, name, filtered, setFiltered }: FilterBoxProperties) {
    return (
        <CheckboxInput
            children={name}
            key={tag}
            value={tag}
            selected={filtered.includes(tag)}
            onChange={state => {
                state 
                ? setFiltered(filtered => filtered.concat(tag))
                : setFiltered(filtered => filtered.filter(f => f !== tag));
            }} />
    );
}