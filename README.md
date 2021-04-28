# @substrate/dev

JS/TS development environment configuration and dependencies for @substrate projects.

## Release && Publishing

You must first be a member, and developer within the npm @substrate org before being able to publish this package to npm. You must also have 2FA enabled.

1. Create a branch 'name-v0-5-0'.

2. Manually update the changelog with the commits leading up to the current release.

3. Update the version inside of the package.json (NOTE: Very important for NPM).

4. Send a PR up and merge into main/master. 

    * example commit: `git commit -m 'chore(release): 0.5.0'`

5. Pull main/master down and follow the commands below.

```
$ yarn npm login
$ yarn npm publish
```

6. Setup the git tags with the following commands

```
$ git tag v0.5.0
$ git push origin --tags
```

7. Setup the tag release in the github repo. 
