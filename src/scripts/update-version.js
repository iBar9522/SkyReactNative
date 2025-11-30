const fs = require('fs')
const path = require('path')

const pkg = require('../../package.json')
const versionName = pkg.version

/** === ANDROID: build.gradle === */
const gradlePath = path.resolve(__dirname, '../../android/app/build.gradle')
let gradle = fs.readFileSync(gradlePath, 'utf8')

gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`)
gradle = gradle.replace(/versionCode\s+(\d+)/, (_, code) => {
	return `versionCode ${parseInt(code) + 1}`
})
fs.writeFileSync(gradlePath, gradle)

/** === iOS: Info.plist === */
const iosProjectName = fs
	.readdirSync(path.resolve(__dirname, '../../ios'))
	.find(f =>
		fs.existsSync(path.resolve(__dirname, `../../ios/${f}/Info.plist`))
	)

if (iosProjectName) {
	const plistPath = path.resolve(
		__dirname,
		`../../ios/${iosProjectName}/Info.plist`
	)
	let plist = fs.readFileSync(plistPath, 'utf8')

	plist = plist.replace(
		/<key>CFBundleShortVersionString<\/key>\s*<string>[^<]+<\/string>/,
		`<key>CFBundleShortVersionString</key>\n\t<string>${versionName}</string>`
	)

	plist = plist.replace(
		/<key>CFBundleVersion<\/key>\s*<string>(\d+)<\/string>/,
		(_, versionCode) => {
			const newCode = parseInt(versionCode) + 1
			return `<key>CFBundleVersion</key>\n\t<string>${newCode}</string>`
		}
	)

	fs.writeFileSync(plistPath, plist)
}
