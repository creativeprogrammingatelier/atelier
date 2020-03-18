import React, {Fragment, useEffect, useState} from "react";
import {Frame} from "../frame/Frame";
import {DataBlockList} from "../general/data/DataBlockList";
import {Loading} from "../general/loading/Loading";
import {Submission} from "../../../../models/api/Submission";
import {coursePermission, getCourse, getCourseMentions, getCourseSubmissions} from "../../../helpers/APIHelper";
import {Uploader} from "../uploader/Uploader";
import {Jumbotron} from "react-bootstrap";
import {Course, CoursePartial} from "../../../../models/api/Course";
import {Mention} from "../../../../models/api/Mention";
import {CourseInvites} from "../invite/CourseInvite";
import {Permission} from "../../../../models/api/Permission";
import {containsPermission, PermissionEnum} from "../../../../models/enums/permissionEnum";
import {PermissionSettings} from "../settings/PermissionSettings";
import {DataList} from "../general/data/DataList";
import {UpdateCourse} from "../settings/Course/UpdateCourse";

interface CourseOverviewProps {
    match: {
        params: {
            courseId: string
        }
    }
}

export function CourseOverview({match}: CourseOverviewProps) {
    const [reload, updateReload] = useState(0);
    const [permissions, setPermissions] = useState(0);


    useEffect(() => {
        coursePermission(match.params.courseId, true)
            .then((permission: Permission) => {
                setPermissions(permission.permissions);
            })
    }, []);

    return (
        <Frame title="Course" sidebar search={"/course/../search"}>
            <Jumbotron>
                <Loading<Course>
                    loader={(courseId) => getCourse(courseId, false)}
                    params={[match.params.courseId]}
                    component={course => <Fragment><h1>{course.name}</h1><p>Created by {course.creator.name}</p>
                    </Fragment>}
                />
            </Jumbotron>
            <Loading<Submission[]>
                loader={(courseId, reload) => getCourseSubmissions(courseId, false)}
                params={[match.params.courseId, reload]}
                component={submissions =>
                    <DataBlockList
                        header="Submissions"
                        list={submissions.map(submission => {
                            console.log(submission);
                            return {
                                transport: `/submission/${submission.ID}`,
                                title: submission.name,
                                text: submission.name,
                                time: new Date(submission.date),
                                tags: []
                                //tags: submission.tags
                            };
                        })}
                    />
                }
            />
            <div className="m-3">
                <Uploader
                    courseId={match.params.courseId}
                    onUploadComplete={() => updateReload(rel => rel + 1)}
                />
            </div>
            <Loading<Mention[]>
                loader={courseID => getCourseMentions(courseID)}
                params={[match.params.courseId]}
                component={mentions =>
                    <DataBlockList
                        header="Mentions"
                        list={mentions.map(mention => ({
                            transport: `/submission/...#${mention.commentID}`, // TODO: Real url to comment
                            title: mention.commentID,
                            text: "You've been mentioned!",
                            time: new Date(),
                            tags: []
                        }))}
                    />
                }
            />
        </Frame>
    );
}