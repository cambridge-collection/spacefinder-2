"use strict";

const fs = require('fs');
const path = require('path');
const console = require('console');
const yargs = require('yargs');

const options = yargs.usage("Usage: " + path.basename(__filename) + " -c <number> -t <file>")
    .option("c", {
        alias: "count",
        describe: "Number of files to create",
        type: "number",
        default: 1,
        demandOption: false
    })
    .option("t", {
        alias: "template",
        describe: "File to use as template (relative to application root)",
        type: "string",
        default: "admin/space-template.json",
        demandOption: false
    })
    .argv;

const spaces_dir ="../spaces"
const orig_maxid = get_max_spaceid();

for (let i = 1; i <= options["count"]; i++) {
    let new_spaceid = orig_maxid + i;
    let dest_file = generate_path_to_space(spaces_dir, new_spaceid);

    let jsondata = get_template_file(options["template"]);
    jsondata.id = new_spaceid;
    jsondata.title = "New Space " + new_spaceid;
    jsondata.slug = string_to_slug(jsondata.title);
    jsondata.description = "Description of new space " + new_spaceid;

    console.log("Creating " + dest_file + ": " + jsondata.title);
    fs.writeFile(
        path.resolve(__dirname, dest_file),
        JSON.stringify(jsondata, null, '    '),
            err => {
            if (err) {
                console.error(err);
            }
        });
}

function string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    const to = "aaaaeeeeiiiioooouuuunc------";
    for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

function generate_path_to_space(dir, filename) {
    return dir + "/" + filename + '.json'
}

function get_template_file(template_file) {
    let filepath = path.isAbsolute(template_file) ? template_file : process.cwd() + "/" + template_file
    let data = fs.readFileSync(path.resolve(filepath), { encoding: 'utf8' });
    return JSON.parse(data);
}

function get_max_spaceid() {
    const spacefiles = fs.readdirSync(
        path.resolve(__dirname, spaces_dir),
        {encoding: 'utf8'}
    )
        .filter(file => {
            return path.extname(file).toLowerCase() === '.json';
        });

    return Math.max.apply(Math, spacefiles.flatMap((x) => Number(path.parse(x).name)));
}