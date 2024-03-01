oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g cpi-configuration-versions
$ cpi-configuration-versions COMMAND
running command...
$ cpi-configuration-versions (--version)
cpi-configuration-versions/0.0.0 darwin-arm64 node-v21.6.2
$ cpi-configuration-versions --help [COMMAND]
USAGE
  $ cpi-configuration-versions COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`cpi-configuration-versions hello PERSON`](#cpi-configuration-versions-hello-person)
* [`cpi-configuration-versions hello world`](#cpi-configuration-versions-hello-world)
* [`cpi-configuration-versions help [COMMANDS]`](#cpi-configuration-versions-help-commands)
* [`cpi-configuration-versions plugins`](#cpi-configuration-versions-plugins)
* [`cpi-configuration-versions plugins:install PLUGIN...`](#cpi-configuration-versions-pluginsinstall-plugin)
* [`cpi-configuration-versions plugins:inspect PLUGIN...`](#cpi-configuration-versions-pluginsinspect-plugin)
* [`cpi-configuration-versions plugins:install PLUGIN...`](#cpi-configuration-versions-pluginsinstall-plugin-1)
* [`cpi-configuration-versions plugins:link PLUGIN`](#cpi-configuration-versions-pluginslink-plugin)
* [`cpi-configuration-versions plugins:uninstall PLUGIN...`](#cpi-configuration-versions-pluginsuninstall-plugin)
* [`cpi-configuration-versions plugins reset`](#cpi-configuration-versions-plugins-reset)
* [`cpi-configuration-versions plugins:uninstall PLUGIN...`](#cpi-configuration-versions-pluginsuninstall-plugin-1)
* [`cpi-configuration-versions plugins:uninstall PLUGIN...`](#cpi-configuration-versions-pluginsuninstall-plugin-2)
* [`cpi-configuration-versions plugins update`](#cpi-configuration-versions-plugins-update)

## `cpi-configuration-versions hello PERSON`

Say hello

```
USAGE
  $ cpi-configuration-versions hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/Development/cpi-configuration-versions/blob/v0.0.0/src/commands/hello/index.ts)_

## `cpi-configuration-versions hello world`

Say hello world

```
USAGE
  $ cpi-configuration-versions hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ cpi-configuration-versions hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/Development/cpi-configuration-versions/blob/v0.0.0/src/commands/hello/world.ts)_

## `cpi-configuration-versions help [COMMANDS]`

Display help for cpi-configuration-versions.

```
USAGE
  $ cpi-configuration-versions help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for cpi-configuration-versions.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.12/src/commands/help.ts)_

## `cpi-configuration-versions plugins`

List installed plugins.

```
USAGE
  $ cpi-configuration-versions plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ cpi-configuration-versions plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.2/src/commands/plugins/index.ts)_

## `cpi-configuration-versions plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ cpi-configuration-versions plugins add plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ cpi-configuration-versions plugins add

EXAMPLES
  $ cpi-configuration-versions plugins add myplugin 

  $ cpi-configuration-versions plugins add https://github.com/someuser/someplugin

  $ cpi-configuration-versions plugins add someuser/someplugin
```

## `cpi-configuration-versions plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ cpi-configuration-versions plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ cpi-configuration-versions plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.2/src/commands/plugins/inspect.ts)_

## `cpi-configuration-versions plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ cpi-configuration-versions plugins install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ cpi-configuration-versions plugins add

EXAMPLES
  $ cpi-configuration-versions plugins install myplugin 

  $ cpi-configuration-versions plugins install https://github.com/someuser/someplugin

  $ cpi-configuration-versions plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.2/src/commands/plugins/install.ts)_

## `cpi-configuration-versions plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ cpi-configuration-versions plugins link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ cpi-configuration-versions plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.2/src/commands/plugins/link.ts)_

## `cpi-configuration-versions plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ cpi-configuration-versions plugins remove plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ cpi-configuration-versions plugins unlink
  $ cpi-configuration-versions plugins remove

EXAMPLES
  $ cpi-configuration-versions plugins remove myplugin
```

## `cpi-configuration-versions plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ cpi-configuration-versions plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.2/src/commands/plugins/reset.ts)_

## `cpi-configuration-versions plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ cpi-configuration-versions plugins uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ cpi-configuration-versions plugins unlink
  $ cpi-configuration-versions plugins remove

EXAMPLES
  $ cpi-configuration-versions plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.2/src/commands/plugins/uninstall.ts)_

## `cpi-configuration-versions plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ cpi-configuration-versions plugins unlink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ cpi-configuration-versions plugins unlink
  $ cpi-configuration-versions plugins remove

EXAMPLES
  $ cpi-configuration-versions plugins unlink myplugin
```

## `cpi-configuration-versions plugins update`

Update installed plugins.

```
USAGE
  $ cpi-configuration-versions plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.2/src/commands/plugins/update.ts)_
<!-- commandsstop -->
