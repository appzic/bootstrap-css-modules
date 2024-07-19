import fs from "node:fs";
import { exec } from "node:child_process";
import axios from "axios";
import unzipper from "unzipper";

const VERSION = "1.0.0";

async function download() {
	try {
		const url = `https://github.com//twbs/bootstrap/archive/refs/tags/v${VERSION}.zip`;
		const response = await axios.get(url, { responseType: "arraybuffer" });
		const fileData = Buffer.from(response.data, "binary");
		fs.writeFileSync(`temp/bs-${VERSION}.zip`, fileData);
	} catch (err) {
		console.error(err);
	}
}

async function unzip() {
	const directory = await unzipper.Open.file(`temp/bs-${VERSION}.zip`);
	await directory.extract({ path: "temp" });
}

async function main() {
	exec("mkdir -p temp");
	await download();
	await unzip();
}

main();
