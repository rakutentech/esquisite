# ESquisite

A library of exquisite helpers and utilities for ES apps.

## Contributing

This repository is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) which leverages [pnpm](https://pnpm.js.org/) for dependency management.

To begin, please install `pnpm`:

```console
$ npm install pnpm -g
```

### Working with Plugin Packages

All plugin packages are kept in the `/packages` directory.

#### Adding dependencies:

```console
$ pnpm add <package> --filter ./packages/<name>
```

Where `<package>` is the name of the NPM package you wish to add for a plugin package, and `<name>` is the proper name of the plugin. e.g. `@rakutentech/foo`.

#### Publishing:

```console
$ pnpm run publish -- <name> [flags]
```

Where `<name>` is the portion of the plugin package name following `@rakutentech/`, e.g. `foo`)

The publish script performs the following actions:

- Gathers commits from the last release tag
- Determines the next appropriate version bump (major, minor, or patch)
- Updates `package.json`
- Generates a new ChangeLog entry
- Updates `CHANGELOG.md` for the target plugin
- Commits `package.json` and `CHANGELOG.md`, with a commit message is in the form `chore(release): <name>-v<version>`
- Publishes to NPM
- Tags the release in the form `<name>-v<version>` (e.g. `foo-v0.1.0`)
- Pushes the commit and tag to Github

##### Flags

The following flags are available to modify the publish process:

- `--dry` tells the script to perform a dry-run, skipping any file modifications, NPM, or Git Actions. Results from version determination and new ChangeLog additions are displayed.
- `--major`, `--minor`, `--patch` can be used to force a particular type of semver bump.
- `--no-push` will instruct the script not to push changes and tags to Git.
- `--no-tag` will instruct the script not to tag the release.

#### Running Tests:

To run tests on all packages which have changes:

```console
$ pnpm run test
```

To run tests on a specific package:

```console
$ pnpm run test --filter ./packages/<name>
```

Linting:

To lint all packages which have changes:

```console
$ pnpm run lint
```

To lint a specific package:

```console
$ pnpm run lint --filter ./packages/<name>
```

_Note: Scripts in the repository will run the root `test` and `lint` script on those packages which have changes. This is also how the CI pipelines function. To run either on a package outside of that pipeline, use `pnpm run <script> -- @rakutentech/<name>`._

## Meta

[CONTRIBUTING](./.github/CONTRIBUTING.md)

[LICENSE (MIT License)](./LICENSE)
