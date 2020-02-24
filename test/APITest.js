const fetch = require('node-fetch');

const BASE_URL = "http://localhost:5000";
const DEFAULT_COURSE_ID = "00000000-0000-0000-0000-000000000000";
const DEFAULT_SUBMISSION_ID = "00000000-0000-0000-0000-000000000000";
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";
const DEFAULT_FILE_ID = "00000000-0000-0000-0000-000000000000";
const DEFAULT_COMMENTTHREAD_ID = "00000000-0000-0000-0000-000000000000";

function getTest(name, url, type) {
    fetch(BASE_URL + url)
        .then(response => response.json())
        .then(data => {
            console.log(`Result from ${name} : ${url}`);
            console.log(data);
        })
        .catch(error => {
            console.log(`Error: ${url}\n${error}`);
        });
}

getTest(
    'Get Courses',
    '/api/courses',
    'GET'
);

getTest(
    'Get Submissions of a course',
    `/api/submissions/course/${DEFAULT_COURSE_ID}`,
    'GET'
);

getTest(
    'Get Submission of a user',
    `/api/submissions/user/${DEFAULT_USER_ID}`,
    'GET'
);

getTest(
    'Get specific file',
    `/api/file/${DEFAULT_FILE_ID}`,
    'GET'
);

getTest(
    'Get files from a submission',
    `/api/files/submission/${DEFAULT_SUBMISSION_ID}`,
    'GET'
);

getTest(
    'Get comment threads of a submission',
    `/api/commentThreads/submission/${DEFAULT_SUBMISSION_ID}`,
    'GET'
);

getTest(
    'Get comment threads of a file',
    `/api/commentThreads/file/${DEFAULT_FILE_ID}`,
    'GET'
);

// TODO get comment threads of a user (no database support yet
/*getTest(
    'Get comment threads of a user',
    `/api/commentThreads/user/${DEFAULT_USER_ID}`,
    'GET'
);*/

getTest(
    'Get specific comment thread',
    `/api/commentThread/${DEFAULT_COMMENTTHREAD_ID}`,
    'GET'
);