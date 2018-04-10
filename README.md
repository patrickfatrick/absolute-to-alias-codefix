absolute-to-alias-codefix [--location -l][--alias -a][--directory -d]

This codefix exists just to aid in converting your codebase from webpack absolute imports to aliased imports

Example: if you have "./src" mapped as an absolute location in webpack so you can
\`import Component from "components/Component.js"\`, this can convert _all_ absolute imports
from that location to something like \`import Component from "~/components/Component.js"\`.

This script catches ES2015 import statements (both default and named) as well as require statements
and jest.mock statements.

Options:
--help -h view the list of options
--location -l source location currently being accessed as an absolute, defaults to "src"
--alias -a alias to use in place of the absolute, defaults to "~"
--directory -d absolute path to the root of the project, defaults to the current directory