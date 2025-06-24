/*
 * "THE BEER-WARE LICENSE" (Revision 42):
 * 
 * shurd@FreeBSD.ORG wrote this file. As long as you retain this notice
 * you can do whatever you want with this stuff. If we meet some day, and
 * you think this stuff is worth it, you can buy me a beer in return.
 * 
 * Stephen Hurd
 */

import spells from "./spells.js";
import wizard from "./wizard.js";

function getSummary() {
	let styles = {};
	let schools = {};
	
	for (const spell in spells) {
		if (Object.hasOwn(spells, spell)) {
			for (const style of spells[spell].styles) {
				styles[style] = true;
			}
			schools[spells[spell].school] = true;
		}
	}
	const ret = {
		'styles': Object.keys(styles),
		'schools': Object.keys(schools)
	};
	return ret;
}

function checkSource(l1, l2) {
	for (const tgt of l1) {
		if (l2.indexOf(tgt) != -1)
			return true;
	}
	return false;
}

// TODO: This can be more clever, but copy/paste is tooo easy!

function getSpells(sources, ritual, circle) {
	let ret = [];
	for (const spell in spells) {
		if (Object.hasOwn(spells, spell)) {
			if (!checkSource(sources, spells[spell].sources))
				continue;
			if (!ritual && spells[spell].circle !== circle)
				continue;
			if (ritual ^ spells[spell].ritual)
				continue;
			ret.push(spell);
		}
	}
	return ret;
}

function getSpellsByStyle(sources, style, ritual, circle) {
	let ret = [];
	for (const spell in spells) {
		if (Object.hasOwn(spells, spell)) {
			if (!checkSource(sources, spells[spell].sources))
				continue;
			if (!ritual && spells[spell].circle !== circle)
				continue;
			if (ritual ^ spells[spell].ritual)
				continue;
			if (!spells[spell].styles.includes(style))
				continue;
			ret.push(spell);
		}
	}
	return ret;
}

function getSpellsBySchool(sources, school, ritual, circle) {
	let ret = [];
	for (const spell in spells) {
		if (Object.hasOwn(spells, spell)) {
			if (!checkSource(sources, spells[spell].sources))
				continue;
			if (!ritual && spells[spell].circle !== circle)
				continue;
			if (ritual ^ spells[spell].ritual)
				continue;
			if (spells[spell].school !== school)
				continue;
			ret.push(spell);
		}
	}
	return ret;
}

function getSpellsByStyleAndSchool(sources, style, school, ritual, circle)
{
	let ret = [];
	for (const spell in spells) {
		if (Object.hasOwn(spells, spell)) {
			if (!checkSource(sources, spells[spell].sources))
				continue;
			if (!ritual && spells[spell].circle !== circle)
				continue;
			if (ritual ^ spells[spell].ritual)
				continue;
			if (!spells[spell].school !== school)
				continue;
			if (!spells[spell].styles.includes(style))
				continue;
			ret.push(spell);
		}
	}
	return ret;
}

function addOpt(opt, name) {
	var newOption = document.createElement('option');
	newOption.value = name;
	newOption.innerHTML = name;
	opt.appendChild(newOption);
}

function removeSpell(list, spell) {
	let idx = list.indexOf(spell);
	if (idx !== -1) {
		list.splice(idx, 1);
	}
	return list;
}

const summary = getSummary();
const styleOpt = document.getElementById("style");
const styleBiasOpt = document.getElementById("style-bias");
const schoolOpt = document.getElementById("school");
const schoolBiasOpt = document.getElementById("school-bias");
const authorLevelOpt = document.getElementById("author");
const output = document.getElementById("output");
const generateButton = document.getElementById("generate");
const sources = document.getElementsByName("sources");

function readSources() {
	let ret = [];
	for (const source of sources) {
		if (source.checked) {
			ret.push(source.value);
		}
	}
	return ret;
}

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

function generate() {
	output.innerHTML = "";

	function error(msg) {
		alert(msg);
		throw new Error(msg);
	}

	const st = styleOpt.value;
	const stb = styleBiasOpt.value;
	const sc = schoolOpt.value;
	const scb = schoolBiasOpt.value;
	const w = wizard[authorLevelOpt.value];
	const sources = readSources();

	if (st === undefined) error("Undefined style");
	if (stb === undefined) error("Undefined style bias");
	if (sc === undefined) error("Undefined school");
	if (scb === undefined) error("Undefined school bias");
	if (w === undefined) error("Undefined author stuff");

	for (let o = 0; o < 2; o++) {
		const arr = o ? w.rituals : w.spells;
		if (o) {
			output.innerHTML += "<br><strong>Rituals</strong><br>";
		}
		for (let i = 0; i < arr.length; i++) {
			let ret = [];

			let all = getSpells(sources, i === 0, i);
			let bst = getSpellsByStyle(sources, st, i === 0, i);
			let bsc = getSpellsBySchool(sources, sc, i === 0, i);
			let bb = getSpellsByStyleAndSchool(sources, st, sc, i === 0, i);

			for (let j = 0; j < arr[i]; j++) {
				let spell = null;
				const ust = Math.random() < (stb / 100);
				const usc = Math.random() < (scb / 100);

				if ((spell === null) && ust && usc) {
					if (bb.length > 0) {
						spell = bb[Math.floor(Math.random() * bb.length)];
					}
				}
				if ((spell === null) && ust) {
					if (bst.length > 0) {
						spell = bst[Math.floor(Math.random() * bst.length)];
					}
				}
				if ((spell === null) && usc) {
					if (bsc.length > 0) {
						spell = bsc[Math.floor(Math.random() * bsc.length)];
					}
				}
				if (spell === null) {
					if (all.length > 0) {
						spell = all[Math.floor(Math.random() * all.length)];
					}
				}
				if (spell == null) {
					error("Unable to find a spell!");
				}
				all = removeSpell(all, spell);
				bst = removeSpell(bst, spell);
				bsc = removeSpell(bsc, spell);
				bb = removeSpell(bb, spell);
				spell += ' (' + sources.filter(value => spells[spell].sources.includes(value)) + ')';
				ret.push(spell);
			}
			output.innerHTML += "<strong>Circle " + (i + 1) + ":</strong> " + ret.sort().join(', ')+"<br>";
		}
	}
}

generateButton.addEventListener('click', ()=>{generate();});
