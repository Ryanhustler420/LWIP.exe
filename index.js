const FWIP = require('@randy.tarampi/lwip');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
// const settings = require('./setting.json');
const FILEio = require('./FileIO');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
require('./FileRemover')();

// Multiple command for this file to run
// node index.js please run pad --url "E:\TourPictures\20180527_124950.jpg" --urls "E:\TourPictures\20180527_124950.jpg" "E:\_RaisehandMain\Products\APPS\More Files\Images\desi.png" --dump "./temp" --output_name "same" --args 50 50 50 50 "white"
// node index.js please run pad --url "E:\TourPictures\20180527_124950.jpg" --args 50 50 50 50 "white"

// https://stackoverflow.com/questions/41199981/run-python-script-in-electron-app [Take an idea from this answer]
// what would happen if we build elctron application, this node will no longer work, lets check
// console.log(process.versions.modules);

const avaliableColor = [
    "black",   // {r: 0, g: 0, b: 0, a: 100}
    "white",    // {r: 255, g: 255, b: 255, a: 100}
    "gray",     // {r: 128, g: 128, b: 128, a: 100}
    "red",      // {r: 255, g: 0, b: 0, a: 100}
    "green",    // {r: 0, g: 255, b: 0, a: 100}
    "blue",     // {r: 0, g: 0, b: 255, a: 100}
    "yellow",   // {r: 255, g: 255, b: 0, a: 100}
    "cyan",     // {r: 0, g: 255, b: 255, a: 100}
    "magenta",  // {r: 255, g: 0, b: 255, a: 100}
];

const availableFunctions = [{
    name: 'pad',
    args_example: '[left top right bottom backgroundColor], example: 50 80 60 150 "white" [NOTE: value >= 50 && value <= 150]',
    args: { minLeft: 50, maxLeft: 150, minTop: 50, maxTop: 150, minRight: 50, maxTop: 150, minRight: 50, maxRight: 150, minBottom: 50, maxBottom: 150 },
    validateArgs: function (args) {
        const o = this.args;
        return (args.length > 4) && (args[0] >= o.minLeft && args[0] <= o.maxLeft) &&
            (args[1] >= o.minTop && args[1] <= o.maxTop) && (args[2] >= o.minRight && args[2] <= o.maxRight) &&
            (args[3] >= o.minBottom && args[3] <= o.maxBottom) && (avaliableColor.indexOf(args[4].toLowerCase()) != -1);
    }
}];

const output = yargs(hideBin(process.argv))
    .group(['clean', 'please'], 'Core Functions').wrap(null)
    .command('clean', 'clean the workspace before progressing further operation', function (yargs) {
        return yargs
            .example("$0 clean --type everything|images|dumps", "Just an example about how to organise the command")
            // .config({ extends: './setting.json', logLevel: 'Verbose' })
            .option('type', {
                describe: 'Please mention what kinda operation you want to perform',
                type: 'array',
                default: ['dumps'],
                choices: ['everything', 'images', 'dumps']
            }).coerce('type', opt => {
                opt.extra = true;
                return opt;
            })
    }, function (args) {
        console.log(args.type);
    })
    .command('please', 'help you to call various function after you write please keyword', function (yargs) {
        return yargs
            // .config({ extends: './setting.json', logLevel: 'Verbose' })
            .usage('./$0 please <function> [url] [args...] [urls...] [output_name] [dump] [resultFile] - hit return key to execute further')
            .option('url', {
                describe: 'please provide local image file path which you want to manupulate',
                type: 'string',
            })
            .option('urls', {
                describe: 'please provide local images urls path which you want to manupulate',
                type: 'array',
            })
            .option('dump', {
                describe: 'please provide arguments for given function name',
                default: 'build/js/pickup',
            })
            .option('args', {
                describe: 'please provide arguments for given function name',
                demandOption: true,
                array: true
            })
            .option('function', {
                describe: 'please provide function name that you want to run',
                type: 'string',
                demandOption: true,
                choices: _.map(availableFunctions, e => e.name),
            })
            .option('output_name', {
                describe: 'please provide arguments for given function name',
                default: 'timestamp',
                choices: ['same', 'timestamp']
            })
            .option('resultFile', {
                describe: 'please provide a file name to which the console dump will be place',
                type: 'string',
                default: 'carry.json'
            })
            .group(_.map(availableFunctions, e => e.name), 'args')
            .describe(availableFunctions[0].name, availableFunctions[0].args_example)

            .example('please run pad --url "C:/users/cat/smile_one.png" 25 25 35 36 "white"')
            .example('please run pad --urls "C:/users/cat/smile_one.png" "D:/pictures/pussy.jpg" "D:/pictures/furniture.jpg" "D:/pictures/gun.jpg" "D:/pictures/bj.jpg" 100 150 150 70 "blue"')
            .command('run <function> [url] [args] [urls] [output_name] [dump] [resultFile]', '- runs a function by given name and arguments', (yargs) => {
                yargs
                    .positional('function', {})
                    .positional('url', {})
                    .positional('urls', {})
                    .positional('args', {})
                    .positional('output_name', {})
                    .positional('dump', {})
                    .positional('resultFile', {})
            })
            .fail(function (msg, err, yargs) {
                console.dir(msg);
                console.dir('You almost broke it!');
                console.error('You should be doing', yargs.help());
                process.exit(1);
            })
    }, function (argv) {
        console.log(argv.type);
    })
    .epilogue('This script is build by Gaurav Gupta for public to use, you can follow him on github https://github.com/Ryanhustler420.')
    .epilog(`
        ******************************************************************************
        NOTE: Please only provide .JPG type image, it only support .JPG file as of now
        ******************************************************************************
    `)
    .wrap(130)
    .help()
    .argv

const selectedFunctionPos = _.indexOf(_.map(availableFunctions, e => e.name), output.function);
if (selectedFunctionPos == -1) { console.log({}); return; }

const selectedFunction = availableFunctions[selectedFunctionPos];
const isValidArgs = selectedFunction.validateArgs(output.args);
if (!isValidArgs) { console.log({}); return; }

FILEio.createPath(output.dump).then(async () => {

    // handle error, or wrong args
    // https://github.com/randytarampi/lwip [Documentation]
    const folder = `${output.dump}`

    if (output.url) { // single url present

        const urlResult = {};
        const fileName = `${path.parse(output.url).base}`;
        const fileExtention = `${fileName.split('.').pop()}`; // .png causing error
        urlResult['fname_we'] = `${Date.now()}.jpg`; // `${Date.now()}.${fileExtention}` causing [Error: Invalid PNG buffer]
        urlResult['imageDump'] = `${folder}/${urlResult['fname_we']}`;
        output.urlResult = urlResult;

        await copyFileToLocal(output.url, urlResult.imageDump);
        const response = await openImageWithFWIP(urlResult.imageDump);
        if (response) await padImage(response, output.args[0], output.args[1], output.args[2], output.args[3], output.args[4], urlResult.imageDump);

        await FILEio.writeJSON(folder, output.resultFile, output);

        console.log(output);

    } else if (output.urls.length > 0) { // multiple urls present

        const urlsResult = { names: [], imageDumps: [] }; // will be removed from receiver, dont know why we need this blank element, but without this it will not work;
        output.urlsResult = urlsResult;

        for (let urlPos = 0; urlPos < output.urls.length; urlPos++) {

            const fileName = `${path.parse(output.urls[urlPos]).base}`;
            const fileExtention = `${fileName.split('.').pop()}` // .png causing error
            const fwe = `${Date.now()}.jpg`; // `${Date.now()}.${fileExtention}` causing [Error: Invalid PNG buffer]
            const fullPath = `${folder}/${fwe}`;

            await copyFileToLocal(output.urls[urlPos], fullPath);
            const response = await openImageWithFWIP(fullPath);
            if (response) await padImage(response, output.args[0], output.args[1], output.args[2], output.args[3], output.args[4], fullPath);

            output.urlsResult.names.push(fwe);
            output.urlsResult.imageDumps.push(fullPath);

            await FILEio.writeJSON(folder, output.resultFile, output); // this line should be at the last because we are changing the object structure
        }

        console.log(output);

    } else console.log({}); // not url/urls present so just abort the operation

}).catch(console.error);

async function copyFileToLocal(filePath, dumpAt /* full path with file name and extention where you want to place image at */) {
    return new Promise((resolve, _) => fs.copyFile(filePath, dumpAt, () => resolve(dumpAt)));
}

async function openImageWithFWIP(imagePath) {
    return new Promise((resolve, _) => {
        FWIP.open(imagePath, async (err, image) => {
            if (err) resolve(null);
            resolve(image);
        });
    });
}

async function padImage(FWIPImageFile, left, top, right, bottom, bgColor, imagePath) {
    return new Promise((resolve, _) => {
        FWIPImageFile.batch().pad(left, top, right, bottom, bgColor)
            .writeFile(imagePath, async err => {
                if (err) { resolve(null); }
                resolve(true);
            });
    });
}