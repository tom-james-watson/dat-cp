import fs from 'fs'
import path from 'path'
import {expect} from 'chai'
import spawnSend from './lib/spawn-send'
import spawnRcv from './lib/spawn-receive'
import cleanTmp from './lib/clean-tmp'

describe('Integration', function() {

  function getOutFiles(filepath = '') {
    const items = fs.readdirSync(path.join('test', 'tmp', filepath))
    return items.filter(x => x !== '.gitignore')
  }

  afterEach(async function() {
    await cleanTmp()
  })

  it('should send/receive single file', async function () {
    this.timeout(10000)

    const key = await spawnSend('test/fixtures/simple/hello.txt')
    await spawnRcv(`${key} --skip-prompt`)

    expect(getOutFiles()).to.deep.equal(['hello.txt'])
  })

  it('should fail with non-existing key', function (done) {
    (async () => {
      this.timeout(20000)

      try {
        await spawnRcv('62528020ce8814fd5f87c5a7d0402f78ee5f19fd6815c138152f43b306b8f8ef')
      } catch (err) {
        done()
      }
    })()
  })

  it('should send/receive dirs', async function () {
    this.timeout(10000)

    const key = await spawnSend('test/fixtures/dirs -r')
    await spawnRcv(`${key} --skip-prompt`)

    expect(getOutFiles()).to.deep.equal(['dirs'])
    expect(getOutFiles('dirs')).to.deep.equal(['dir1', 'dir2'])
    expect(getOutFiles('dirs/dir1')).to.deep.equal(['hello.txt'])
    expect(getOutFiles('dirs/dir2')).to.deep.equal(['dir3', 'foo.txt'])
    expect(getOutFiles('dirs/dir2/dir3')).to.deep.equal(['fizz.txt'])
  })

  it('should fail when sending dir without recursive', function (done) {
    (async () => {
      this.timeout(5000)

      try {
        await spawnSend('test/fixtures/dirs')
      } catch (err) {
        done()
      }
    })()
  })

  it('should not error when redownloading same files', async function () {
    this.timeout(10000)

    const key = await spawnSend('test/fixtures/dirs -r')
    await spawnRcv(`${key} --skip-prompt`)

    expect(getOutFiles()).to.deep.equal(['dirs'])
    expect(getOutFiles('dirs')).to.deep.equal(['dir1', 'dir2'])
    expect(getOutFiles('dirs/dir1')).to.deep.equal(['hello.txt'])
    expect(getOutFiles('dirs/dir2')).to.deep.equal(['dir3', 'foo.txt'])
    expect(getOutFiles('dirs/dir2/dir3')).to.deep.equal(['fizz.txt'])

    await spawnRcv(`${key} --skip-prompt`)

    expect(getOutFiles()).to.deep.equal(['dirs'])
    expect(getOutFiles('dirs')).to.deep.equal(['dir1', 'dir2'])
    expect(getOutFiles('dirs/dir1')).to.deep.equal(['hello.txt'])
    expect(getOutFiles('dirs/dir2')).to.deep.equal(['dir3', 'foo.txt'])
    expect(getOutFiles('dirs/dir2/dir3')).to.deep.equal(['fizz.txt'])
  })

  it('should send/receive a dirs contents if specified with /', async function () {
    this.timeout(10000)

    const key = await spawnSend('test/fixtures/dirs/ -r')
    await spawnRcv(`${key} --skip-prompt`)

    expect(getOutFiles()).to.deep.equal(['dir1', 'dir2'])
    expect(getOutFiles('dir1')).to.deep.equal(['hello.txt'])
    expect(getOutFiles('dir2')).to.deep.equal(['dir3', 'foo.txt'])
    expect(getOutFiles('dir2/dir3')).to.deep.equal(['fizz.txt'])
  })

  it('should skip dirs if send/receive multiple without recursive', async function () {
    this.timeout(10000)

    const key = await spawnSend('test/fixtures/dirs/dir2/foo.txt test/fixtures/dirs/dir2/dir3')
    await spawnRcv(`${key} --skip-prompt`)

    expect(getOutFiles()).to.deep.equal(['foo.txt'])
  })

  it('should skip non files/dirs', async function () {
    this.timeout(10000)

    const key = await spawnSend('test/fixtures/complex -r')
    await spawnRcv(`${key} --skip-prompt`)

    expect(getOutFiles()).to.deep.equal(['complex'])
    expect(getOutFiles('complex')).to.deep.equal(['hello.txt'])
  })

})
