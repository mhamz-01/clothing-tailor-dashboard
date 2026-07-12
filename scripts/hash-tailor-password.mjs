// Prints a bcrypt hash for a plaintext password so it can be pasted into the
// `password_hash` column when manually inserting a row into
// tailor_credentials (there is no signup UI for this module by design).
//
// Usage: npm run hash-password -- <plaintext-password>
import bcrypt from "bcryptjs"

const password = process.argv[2]

if (!password) {
  console.error("Usage: npm run hash-password -- <plaintext-password>")
  process.exit(1)
}

const hash = await bcrypt.hash(password, 10)
console.log(hash)
