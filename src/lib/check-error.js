export default function checkError(err) {
  if (err) {
    console.log(err)
    process.exit(1)
  }
}
