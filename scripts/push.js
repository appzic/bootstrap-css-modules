import fs from "node:fs";
import { execSync } from "node:child_process";
import { rimrafSync } from "rimraf";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";
import { camelCase } from "change-case";

class Push {
	constructor() {
		this.version = this._readVersion();

		this.ioFiles = [
			{
				src: `temp/bootstrap-${this.version}/dist/css/bootstrap.css`,
				dist: `dist/bootstrap.module.css`,
			},
		];
	}

	_readVersion() {
		const jsonData = fs.readFileSync("package.json", { encoding: "utf-8" });
		const obj = JSON.parse(jsonData);
		return obj.version;
	}

	convertClassNames(css) {
		const root = postcss.parse(css, { parser: safeParser });

		root.walkRules((rule) => {
			if (rule.selector) {
				rule.selector = rule.selector.replace(/\.([\w-]+)/g, (match, p1) => {
					return `.${camelCase(p1)}`;
				});
			}
		});

		return root.toString();
	}

	mkCSSModules() {
		this.ioFiles.forEach(({ src, dist }) => {
			let data = fs.readFileSync(src, { encoding: "utf-8" });
			data = this.convertClassNames(data);
			fs.writeFileSync(dist, data);
		});
	}

	run() {
		rimrafSync("dist");
		execSync("mkdir -p dist");
		this.mkCSSModules();
		execSync("npm run typed-css");
		execSync("npm run format");
		execSync("npm i");
		execSync("git add .");
		execSync(`git commit -m "v${this.version}"`);
		execSync("git push");
		execSync(`git tag v${this.version}`);
		execSync("git push --tag");
		execSync("npm publish --access public");
		rimrafSync("temp");
	}
}

const push = new Push();
push.run();
