/*
 * "THE BEER-WARE LICENSE" (Revision 42):
 * 
 * shurd@FreeBSD.ORG wrote this file. As long as you retain this notice
 * you can do whatever you want with this stuff. If we meet some day, and
 * you think this stuff is worth it, you can buy me a beer in return.
 * 
 * Stephen Hurd
 */

import wizard from "./wizard.js";
import sources from "./sources.js";
import { summary, generateSpellbook } from "./spellbook.js";

const styleOpt = document.getElementById("style");
const styleBiasOpt = document.getElementById("style-bias");
const schoolOpt = document.getElementById("school");
const schoolBiasOpt = document.getElementById("school-bias");
const authorLevelOpt = document.getElementById("author");
const output = document.getElementById("output");
const generateButton = document.getElementById("generate");
const sourceDiv = document.getElementById("sources");

function addOpt(opt, name) {
	var newOption = document.createElement('option');
	newOption.value = name;
	newOption.innerHTML = name;
	opt.appendChild(newOption);
}

function addSource(source, label, def) {
	sourceDiv.innerHTML += '<label><input type="checkbox" name="sources" value="' + source + '"' + (def ? ' checked' : '') + "> " + label + "</label> ";
}

function readSources() {
	const se = document.getElementsByName("sources");
	let ret = [];
	for (const source of se) {
		if (source.checked) {
			ret.push(source.value);
		}
	}
	return ret;
}

function generate() {
	output.innerHTML = "<strong>Spells</strong><br>";

	try {
		const book = generateSpellbook(styleOpt.value, styleBiasOpt.value, schoolOpt.value, schoolBiasOpt.value, wizard[authorLevelOpt.value], readSources());

		for (let i = 0; i < book.spells.length; i++) {
			output.innerHTML += "<strong>Circle " + (i + 1) + ":</strong> " + book.spells[i].sort().join(', ')+"<br>";
		}
		output.innerHTML += "<br><strong>Rituals</strong><br>";
		for (let i = 0; i < book.rituals.length; i++) {
			output.innerHTML += "<strong>Circle " + (i + 1) + ":</strong> " + book.rituals[i].sort().join(', ')+"<br>";
		}
	}
	catch (e) {
		alert(e.message);
	}
}

// Fill out the form...

for (const style of summary.styles) {
	addOpt(styleOpt, style);
}

for (const school of summary.schools) {
	addOpt(schoolOpt, school);
}

styleBiasOpt.innerHTML = '';
for (let i = 0; i < 100; i += 5) {
	addOpt(styleBiasOpt, i);
	addOpt(schoolBiasOpt, i);
}

authorLevelOpt.innerHTML = '';
for (const level in wizard) {
	if (Object.hasOwn(wizard, level)) {
		addOpt(authorLevelOpt, level);
	}
}

for (const source of sources) {
	addSource(source.source, source.name, source.enabled);
}

generateButton.addEventListener('click', ()=>{generate();});
