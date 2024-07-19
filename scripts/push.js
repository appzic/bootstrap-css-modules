import fs from "node:fs";
import { exec } from "node:child_process";
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
	exec("mkdir -p dist");
	updateVersion();
	mkCSSModules();
	exec("npm run typed-css");
	exec("npm run format");
	rimrafSync("temp");
}

main();
