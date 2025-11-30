const fs = require('fs')
const path = require('path')

const pkg = require('../../package.json')
const version = pkg.version

const srcPath = path.resolve(
	__dirname,
	'../../android/app/build/outputs/apk/release/app-release.apk'
)
const destDir = path.resolve(__dirname, '../../release')
const destFileName = `sbi-app-v${version}.apk`
const destPath = path.join(destDir, destFileName)

if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir)
}

if (fs.existsSync(srcPath)) {
	fs.copyFileSync(srcPath, destPath)
} else {
	process.exit(1)
}
