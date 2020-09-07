import React, {Fragment} from "react";

import {SearchResult} from "../../../../models/api/SearchResult";

import {ParentalProperties} from "../../helpers/ParentHelper";
import {TimeHelper} from "../../helpers/TimeHelper";

import {DataBlock} from "../data/DataBlock";
import {DataItem} from "../data/DataItem";
import {DataList} from "../data/DataList";

interface SearchResultProperties {
    results: SearchResult,
    course?: string
	// More stuff to support the load more functionality
}
export function SearchResults({results, course}: SearchResultProperties) {
	return <Fragment>
		{
            results.users.length > 0 &&
			<SearchResultSection header="Users" query="">
				{results.users.map(user => 
                    <DataItem 
                        key={user.ID} 
                        text={user.name} 
                        transport={
                            course === undefined
                            ? `/user/${user.ID}`
                            : `/course/${course}/user/${user.ID}`
                        } />
                )}
			</SearchResultSection>
		}
		{
			results.courses.length > 0 && 
            <SearchResultSection header="Courses" query="">
				{results.courses.map(course =>
					<DataItem key={course.ID} text={course.name} transport={"/course/" + course.ID}/>
				)}
			</SearchResultSection>
		}
		{
			results.submissions.length > 0 &&
			<SearchResultSection header="Submissions" query="">
				{results.submissions.map(submission =>
					<DataBlock
						key={submission.ID}
						title={submission.name}
						text={`Submitted by ${submission.user.name}`}
						transport={"/submission/" + submission.ID}
						time={TimeHelper.toDateString(TimeHelper.fromString(submission.date))}
					/>
				)}
			</SearchResultSection>
		}
		{
			results.comments.length > 0 &&
			<SearchResultSection header="Comments" query="">
				{results.comments.map(comment =>
					<DataBlock
						key={comment.comment.ID}
						title={`${comment.comment.user.name} on ${comment.submission.name} by ${comment.submission.user.name}`}
						text={comment.comment.text}
						transport={comment.comment.references.fileID === "" ?
							`/submission/${comment.submission.ID}#${comment.comment.references.commentThreadID}`
							:
							`/submission/${comment.submission.ID}/${comment.comment.references.fileID}/comments#${comment.comment.references.commentThreadID}`
						}
						time={TimeHelper.toDateString(TimeHelper.fromString(comment.comment.created))}
					/>
				)}
			</SearchResultSection>
		}
		{
			results.files.length > 0 &&
			<SearchResultSection header="Files" query="">
				{results.files.map(file =>
					<DataBlock
						key={file.file.ID}
						title={file.file.name}
						text={`in ${file.submission.name} by ${file.submission.user.name}`}
						transport={`/submission/${file.submission.ID}/${file.file.ID}`}
						time={TimeHelper.toDateString(TimeHelper.fromString(file.submission.date))}
					/>
				)}
			</SearchResultSection>
		}
		{
			results.snippets.length > 0 &&
			<SearchResultSection header="Snippets" query="">
				{results.snippets.map(snippet =>
					<DataBlock
						key={snippet.snippet.ID}
						title={`${snippet.file.name} in ${snippet.submission.name} by ${snippet.submission.user.name}`}
						text={snippet.snippet.body}
						transport={`/submission/${snippet.submission.ID}/${snippet.file.ID}`}
						time={TimeHelper.toDateString(TimeHelper.fromString(snippet.submission.date))}
					/>
				)}
			</SearchResultSection>
		}
	</Fragment>;
}

interface SearchResultSectionProperties extends ParentalProperties {
	header: string,
	query: string
}
function SearchResultSection({header, query, children}: SearchResultSectionProperties) {
	const loadMore = (limit: number, offset: number) => <p>Loaded more</p>; // TODO: Finish and actually load more
	
	return <DataList collapse header={header} more={loadMore}>
		{children}
	</DataList>;
}