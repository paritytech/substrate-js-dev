# @substrate/dev

JS/TS development environment configuration and dependencies for @substrate projects.

## Release && Publishing

NPM prerequisites: You must be a member of the `@substrate` NPM org and must belong to the `developers` team within the org. (Please make sure you have 2FA enabled.)

1. Create a branch 'name-v0-5-0'.

2. Manually update the changelog with the commits leading up to the current release.

3. Update the version inside of the package.json (NOTE: Very important for NPM).

4. Send a PR up and merge into main/master. 

    * example commit: `git commit -m 'chore(release): 0.5.0'`

5. Pull main/master down and follow the commands below.

```bash
$ yarn npm login
$ yarn npm publish
```

6. Setup the git tags with the following commands

```bash
$ git tag v0.5.0
$ git push origin v0.5.0
```

7. Create a release from the new tag on GitHub.com. 
