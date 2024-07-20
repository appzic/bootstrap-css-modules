import fs from "node:fs";
import { execSync } from "node:child_process";
import axios from "axios";
import unzipper from "unzipper";

class Pull {
	constructor() {
		this.version = this._readVersion();
	}

	_readVersion() {
		const jsonData = fs.readFileSync("package.json", { encoding: "utf-8" });
		const obj = JSON.parse(jsonData);
		return obj.version;
	}

	async download() {
		try {
			const url = `https://github.com//twbs/bootstrap/archive/refs/tags/v${this.version}.zip`;
			const response = await axios.get(url, { responseType: "arraybuffer" });
			const fileData = Buffer.from(response.data, "binary");
			fs.writeFileSync(`temp/bs-${this.version}.zip`, fileData);
		} catch (err) {
			console.error(err);
		}
	}

	async unzip() {
		const directory = await unzipper.Open.file(`temp/bs-${this.version}.zip`);
		await directory.extract({ path: "temp" });
	}

	async run() {
		execSync("mkdir -p temp");
		await this.download();
		await this.unzip();
	}
}

const pull = new Pull();
pull.run();
