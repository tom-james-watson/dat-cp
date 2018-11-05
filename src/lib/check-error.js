export default function checkError(err) {
  if (err) {
    console.error(err)
    process.exit(1)
  }
}
