export interface File {
    ID: string,
    name: string,
    type: string
    references: {
        courseID: string,
        submissionID: string,
    }
}
