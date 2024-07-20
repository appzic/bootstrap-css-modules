import fs from "node:fs";
import { execSync } from "node:child_process";
import { rimrafSync } from "rimraf";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";
import { camelCase } from "change-case";

const VERSION = "1.0.0";
const INPUT_OUTPUT_FILES = [
	{
		src: `temp/bootstrap-${VERSION}/bootstrap-${VERSION}.css`,
		dist: `dist/bootstrap-${VERSION}.module.css`,
	},
];

function updateVersion() {
	const jsonData = fs.readFileSync("package.json", { encoding: "utf-8" });
	const obj = JSON.parse(jsonData);
	obj.version = VERSION;
	fs.writeFileSync("package.json", JSON.stringify(obj));
}

const convertClassNames = (css) => {
	const root = postcss.parse(css, { parser: safeParser });

	root.walkRules((rule) => {
		if (rule.selector) {
			rule.selector = rule.selector.replace(/\.([\w-]+)/g, (match, p1) => {
				return `.${camelCase(p1)}`;
			});
		}
	});

	return root.toString();
};

function mkCSSModules() {
	INPUT_OUTPUT_FILES.forEach(({ src, dist }) => {
		let data = fs.readFileSync(src, { encoding: "utf-8" });
		data = convertClassNames(data);
		fs.writeFileSync(dist, data);
	});
}

async function main() {
	execSync("mkdir -p dist");
	updateVersion();
	execSync("npm i");
	mkCSSModules();
	execSync("npm run typed-css");
	execSync("npm run format");
	execSync("git add .");
	execSync(`git commit -m "v${VERSION}"`);
	execSync("git push");
	execSync(`git tag v${VERSION}`);
	execSync("git push --tag");
	execSync("npm publish --access public");
	rimrafSync("temp");
}

main();
