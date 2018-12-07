import {expect} from 'chai'
import sinon from 'sinon'
import logger from '../src/lib/logger'
import DatCp from '../src/lib/dat-cp'

const sandbox = sinon.createSandbox()

describe('Send', function() {

  beforeEach(() => {
    this.exitSpy = sandbox.spy()
    this.debugSpy = sandbox.spy()
    this.infoSpy = sandbox.spy()
    this.warnSpy = sandbox.spy()
    this.errorSpy = sandbox.spy()

    sandbox.stub(process, 'exit').callsFake((...args) => {
      this.exitSpy(...args)
      throw 'exit'
    })
    sandbox.stub(logger, 'debug').callsFake(this.debugSpy)
    sandbox.stub(logger, 'info').callsFake(this.infoSpy)
    sandbox.stub(logger, 'warn').callsFake(this.warnSpy)
    sandbox.stub(logger, 'error').callsFake(this.errorSpy)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should fail if upload non-existing file', (done) => {
    (async () => {
      const sendDatCp = new DatCp({})
      await sendDatCp.connect()

      try {
        await sendDatCp.upload(['test/fixtures/simple/oops'])
      } catch (e) {
        expect(e).to.equal('exit')
        expect(this.exitSpy.calledOnceWith(1)).to.be.true
        expect(this.errorSpy.calledWith(
          'test/fixtures/simple/oops: No such file or directory.'
        )).to.be.true
        done()
      }
    })()
  })

  it('should upload single file', async () => {
    const sendDatCp = new DatCp({})
    await sendDatCp.connect()
    await sendDatCp.upload(['test/fixtures/simple/hello.txt'])

    expect(sendDatCp.files).to.equal(1)

    expect(this.infoSpy.firstCall.args[0].includes('Total: 1 files')).to.be.true
    expect(this.exitSpy.called).to.be.false
  })

  it('should dry-run upload single file', (done) => {
    (async () => {
      const sendDatCp = new DatCp({dryRun: true})
      await sendDatCp.connect()

      try {
        await sendDatCp.upload(['test/fixtures/simple/hello.txt'])
      } catch (e) {
        expect(e).to.equal('exit')
        expect(sendDatCp.files).to.equal(1)
        expect(this.infoSpy.firstCall.args[0].includes('test/fixtures/simple/hello.txt')).to.be.true
        expect(this.infoSpy.secondCall.args[0].includes('Total: 1 files')).to.be.true
        expect(this.exitSpy.calledOnceWith(0)).to.be.true
        done()
      }
    })()
  })

  it('should fail if upload dir without recursive', (done) => {
    (async () => {
      const sendDatCp = new DatCp({})
      await sendDatCp.connect()

      try {
        await sendDatCp.upload(['test/fixtures/dirs'])
      } catch (e) {
        expect(e).to.equal('exit')
        expect(this.exitSpy.calledOnceWith(1)).to.be.true
        expect(this.errorSpy.calledWith('No files to copy.')).to.be.true
        done()
      }
    })()
  })

  it('should upload dir with recursive', async () => {
    const sendDatCp = new DatCp({recursive: true})
    await sendDatCp.connect()
    await sendDatCp.upload(['test/fixtures/dirs/dir1'])

    expect(sendDatCp.files).to.equal(2)

    expect(this.infoSpy.firstCall.args[0].includes('Total: 2 files')).to.be.true
    expect(this.exitSpy.called).to.be.false
  })

  it('should upload multiple dirs with recursive', async () => {
    const sendDatCp = new DatCp({recursive: true})
    await sendDatCp.connect()
    await sendDatCp.upload(['test/fixtures/dirs'])

    expect(sendDatCp.files).to.equal(7)

    expect(this.infoSpy.firstCall.args[0].includes('Total: 7 files')).to.be.true
    expect(this.exitSpy.called).to.be.false
  })

  it('should upload a dirs contents if specified with /', async () => {
    const sendDatCp = new DatCp({recursive: true})
    await sendDatCp.connect()
    await sendDatCp.upload(['test/fixtures/dirs/'])

    expect(sendDatCp.files).to.equal(6)

    expect(this.infoSpy.firstCall.args[0].includes('Total: 6 files')).to.be.true
    expect(this.exitSpy.called).to.be.false
  })

  it('should dry-run upload directories with recursive', (done) => {
    (async () => {
      const sendDatCp = new DatCp({recursive: true, dryRun: true})
      await sendDatCp.connect()

      try {
        await sendDatCp.upload(['test/fixtures/dirs'])
      } catch (e) {
        expect(e).to.equal('exit')
        expect(sendDatCp.files).to.equal(7)
        expect(this.infoSpy.lastCall.args[0].includes('Total: 7 files')).to.be.true
        expect(this.exitSpy.calledOnceWith(0)).to.be.true
        done()
      }
    })()
  })

  it('should skip dirs if uploading multiple without recursive', async () => {
    const sendDatCp = new DatCp({})
    await sendDatCp.connect()
    await sendDatCp.upload(['test/fixtures/dirs/dir2/foo.txt', 'test/fixtures/dirs/dir2/dir3'])

    expect(sendDatCp.files).to.equal(1)

    expect(this.infoSpy.firstCall.args[0].includes('Total: 1 files')).to.be.true
    expect(this.warnSpy.calledWith(
      'test/fixtures/dirs/dir2/dir3: Is a directory (not copied).'
    )).to.be.true

    expect(this.exitSpy.called).to.be.false
  })

  it('should skip non files/dirs', async () => {
    const sendDatCp = new DatCp({recursive: true})
    await sendDatCp.connect()
    await sendDatCp.upload(['test/fixtures/complex'])

    expect(sendDatCp.files).to.equal(2)

    expect(this.infoSpy.firstCall.args[0].includes('Total: 2 files')).to.be.true
    expect(this.warnSpy.calledWith(
      'test/fixtures/complex/link: Not a file or directory (not copied).'
    )).to.be.true

    expect(this.exitSpy.called).to.be.false
  })

})
