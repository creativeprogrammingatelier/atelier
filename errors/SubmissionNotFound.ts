export class SubmissionNotFound extends Error {
    constructor(message : string) {
        super(message);
        this.name = 'SubmissionNotFound'
    }
}