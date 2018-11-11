`dcp` - Dat Copy
========

> Remote file copy, powered by the Dat protocol.

[![CircleCI branch](https://img.shields.io/circleci/project/github/tom-james-watson/dat-cp/master.svg)](https://circleci.com/gh/tom-james-watson/workflows/dat-cp/tree/master)
[![npm](https://img.shields.io/npm/v/dat-cp.svg)](https://www.npmjs.com/package/dat-cp)
[![npm](https://img.shields.io/node/v/dat-cp.svg)](https://www.npmjs.com/package/dat-cp)
[![NpmLicense](https://img.shields.io/npm/l/dat-cp.svg)](https://www.npmjs.com/package/dat-cp)

`dcp` copies files between hosts on a network using the peer-to-peer [Dat network](https://datproject.org/). `dcp` can be seen as an alternative to tools like `scp`, removing the need to configure SSH access between hosts. This lets you transfer files between two remote hosts, without you needing to worry about the specifics of how said hosts reach each other.

`dcp` requires zero configuration and is secure, fast, and peer-to-peer.

#### How `dcp` works

`dcp` will create a dat archive for a specified set of files or directories and, using the generated public key, lets you download said archive from a second host. Any data shared over the network is encrypted using the public key of the archive, meaning data access is limited to those who have access to said key. For more information on how Dat works, you can browse [the docs](https://docs.datproject.org/) or [read their whitepaper](https://github.com/datproject/docs/blob/master/papers/dat-paper.pdf).

#### Advantages over plain [dat](github.com/datproject/dat)

`dcp` is designed to have an API that is more reminiscent of `scp` and `rsync`. The standard cli `dat` program requires the additional mental overhead of understanding how the underlying Dat protocol works. `dat` forces you to share a single whole folder, whilst with `dcp` you can copy an arbitrary set of paths. `dat` also pollutes the filesystem with metadata files, whereas with `dcp` these are kept in-memory instead.

## Example

Host A:

```
> dcp foo.txt bar.txt
/foo.txt                [========================================] 100% | 0s | 46.00B
/bar.txt                [========================================] 100% | 0s | 49.00B%

Total: 2 files (95.00B)

Paste files on another host with:

        dcp 9dc72a82af84b79208fb2fd0c757c52b00a26d081722f9c6f3c6c389d5a4c963

Upload: 0B (0B/s)
```

Host B:

```
> dcp 9dc72a82af84b79208fb2fd0c757c52b00a26d081722f9c6f3c6c389d5a4c963
/foo.txt                [========================================] 100% | 0s | 46.00B
/bar.txt                [========================================] 100% | 0s | 49.00B%

Total: 2 files (95.00B)
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
