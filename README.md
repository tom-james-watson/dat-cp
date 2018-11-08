Dat Copy
========

Remote file copy, powered by the dat protocol

[![CircleCI](https://circleci.com/gh/tom-james-watson/dat-cp.svg?style=svg)](https://circleci.com/gh/tom-james-watson/dat-cp)

## Installation

```
npm i -g dat-cp
```

## Usage

Machine A:

```
> dcp foo.txt bar.txt
foo.txt                                  [====================] 100%
bar.txt                                  [====================] 100%

Paste files on another machine with:

        dcp 9dc72a82af84b79208fb2fd0c757c52b00a26d081722f9c6f3c6c389d5a4c963
```

Machine B:

```
> dcp 9dc72a82af84b79208fb2fd0c757c52b00a26d081722f9c6f3c6c389d5a4c963
foo.txt                                  [====================] 100%
bar.txt                                  [====================] 100%
```

## Development

Install dependencies:

```
npm i
```

Run the tests:

```
npm t
```

Test the CLI executable

```
npm run cli -- foo.txt -v
```

*Note the `--` preceding the arguments.*
