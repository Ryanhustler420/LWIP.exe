const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const luxon = require('luxon');

const recursive = require("recursive-readdir");

module.exports = async function () {
    checkAndPerformCleanup();
}

async function checkAndPerformCleanup() {
    console.log('File cleaner running...');
    recursive("./", ['*.js', '*.js', '*.ts', '*.json', '*.md', '.npmignore', '*.iml', '.eslintrc', '*.cmd', '*.ps1'], function (err, files) {

        const needToDelete = [];

        for (var file of files) {
            const f_name_w_extention = path.basename(file);
            if (!f_name_w_extention.match(/.(png|jpg)$/i)) continue;

            let fileNameWithoutExtention = f_name_w_extention.split('.')[0].split('-')[0];
            if (!isNumeric(fileNameWithoutExtention)) continue;

            const past = +fileNameWithoutExtention;
            const old = luxon.DateTime.fromJSDate(new Date(past)).toISO();

            const fresh = new luxon.DateTime(Date.now()).plus({ minutes: -10 }).toISO();
            if (old < fresh) needToDelete.push(`${file}`);
        }

        for (var every of needToDelete) fs.unlink(every, () => { });
    });

}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}