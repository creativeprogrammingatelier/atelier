# Contributing to Atelier

Thank you for contributing to Atelier!

## I have found a bug

Please check if someone else has found the same problem by searching [in the list of issues](https://github.com/creativeprogrammingatelier/atelier/issues). If the issue already exists and you feel like you have useful information to add to the issue, please leave a comment. If there is no existing issue, go ahead and [create one](https://github.com/creativeprogrammingatelier/atelier/issues/new/choose). Please describe the issue as clearly as you can and include steps to reproduce the issue.

## I have a feature request

This is similar to bug reports: please search the issue list and contribute to the discussion if an issue already exists. If there is none, create a new issue and describe clearly what you would like Atelier to do.

## I want to write code

Cool! I you have some ideas for Atelier that you would like to add yourself, please submit an issue discussing the feature before starting to write code. If we agree that it would be a good addition, or if you want to work on an existing issue, please follow these guidelines:

- There are two important branches: master and rc. The master branch should always be ready to deploy to production, whereas the rc branch (for release candidate) will run on our staging server for testing. All pull requests for new features or bug fixes should target the rc branch, only rc will ever be merged into master.
- To start working on a new feature, create a new branch and start writing your code in that branch.
- Open a pull request to the rc branch as early as possible, marking it as a draft if you are still working on it. This allows us to easily keep track of what is going on.
- Once your code is finished, remove the 'draft' flag from your pull request and make sure all the boxes of the checklist in the pull request template can be checked.
- At least one other person should review your code, before it can be merged into the rc branch.

If your changes are 'trivial' (e.g. a very minor refactoring, fixing spelling mistakes in documents like these, a very obvious and rather urgent bug), a review of the code is not necessarily required (as there are a limited number of people-hours working on the project).

### Resources for development

The [README](/README.md) contains information about the tools needed to run Atelier on your machine and the general structure of the project. In the [docs](/docs/) folder you can find more detailed information on certain aspects of the project, such as the database schema, information about error handling etc. Please have a look at what is there before writing code, so that you have some idea of what to expect and where to look for information.

### Coding styles

We use ESLint to enforce some coding style rules. Please look at how other code is written and try to make your code fit in. Consistency is [not](https://blog.ploeh.dk/2021/05/17/against-consistency/) the most important thing in the world, so if you have a good reason to do something in a different way than in the rest of the codebase, please do so. In the absence of good reasons, try to make your code fit in with the rest.

As for the style of working with Git: 

- Make small commits that change one thing. If you can't fit the title of your commit message in 72 characters, or it requires use of the word 'and' to describe the changes, the commit is probably too large. You can only add some files to the commit using `git add path/to/some/file` before committing. If you made multiple changes to the same file, use [`git add -p path/to/some/file`](https://stackoverflow.com/a/1085191) (or `git add -i` for the interactive adding mode) to add only some parts of a file to the commit.
- Keep the commit title less than 72 characters. If you feel the need to explain yourself (or write an essay), you may do so in the message body, but make sure that the title gives a clear idea of what the commit does.
- Use the following style for the commit title:
  - Use the present tense (so "Add feature", not "Added feature")
  - Use the imperative mood (so "Move cursor to...", not "Moves cursor to...")
  - Start with uppercase, as if writing a sentence, but don't end with a period (so "Delete stuff", not "delete stuff.")

