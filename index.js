const { hideBin } = require('yargs/helpers');
const LWIP = require('@randy.tarampi/lwip');
const yargs = require('yargs/yargs');
const Jimp = require("jimp");
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

// const settings = require('./setting.json');
const FILEio = require('./FileIO');
require('./FileRemover')();

// Multiple command for this file to run
// node index.js please run pad --url "E:\TourPictures\20180527_124950.jpg" --urls "E:\TourPictures\20180527_124950.jpg" "E:\_RaisehandMain\Products\APPS\More Files\Images\desi.png" --dump "./temp" --output_name "same" --args 50 50 50 50 "white"
// node index.js please run pad --url "E:\TourPictures\20180527_124950.jpg" --urls "E:\TourPictures\20180527_124950.jpg" "E:\_RaisehandMain\Products\APPS\More Files\Images\desi.png" --dump "./temp" --output_name "same" --args 50 50 50 50 "white" --quality 50
// node index.js please run pad --url "E:\TourPictures\20180527_124950.jpg" --args 50 50 50 50 "white"
// node index.js please run pad --url "E:\TourPictures\20180527_124950.jpg" --args 50 50 50 50 "white" --quality 50

// https://stackoverflow.com/questions/41199981/run-python-script-in-electron-app [Take an idea from this answer]
// what would happen if we build elctron application, this node will no longer work, lets check
// console.log(process.versions.modules);

// Make executable file
// pkg --output build/imageFunction .
// pkg --output imageFunction .

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

const input = yargs(hideBin(process.argv))
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
            .usage('./$0 please <function> [url] [args...] [urls...] [quality] [output_name] [dump] [resultFile] - hit return key to execute further')
            .option('url', {
                describe: 'please provide local image file path which you want to manupulate',
                type: 'string',
            })
            .option('urls', {
                describe: 'please provide local images urls path which you want to manupulate',
                type: 'array',
            })
            .option('quality', {
                describe: 'please provide a numaric value, the lesser will reduce the quality of the image',
                type: 'number',
            })
            .option('dump', {
                describe: 'please provide arguments for given function name',
                default: 'output',
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
                default: 'operation.json'
            })
            .group(_.map(availableFunctions, e => e.name), 'args')
            .describe(availableFunctions[0].name, availableFunctions[0].args_example)

            .example('please run pad --url "C:/users/cat/smile_one.png" 25 25 35 36 "white"')
            .example('please run pad --url "C:/users/cat/smile_one.png" 25 25 35 36 "white" --quality 30')
            .example('please run pad --urls "C:/users/cat/smile_one.png" "D:/pictures/pussy.jpg" "D:/pictures/furniture.jpg" "D:/pictures/gun.jpg" "D:/pictures/bj.jpg" 100 150 150 70 "blue"')
            .example('please run pad --urls "C:/users/cat/smile_one.png" "D:/pictures/pussy.jpg" "D:/pictures/furniture.jpg" "D:/pictures/gun.jpg" "D:/pictures/bj.jpg" 100 150 150 70 "blue" --quality 30')
            .command('run <function> [url] [urls] [args] [quality] [output_name] [dump] [resultFile]', '- runs a function by given name and arguments', (yargs) => {
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
    .wrap(130)
    .help()
    .argv

const selectedFunctionPos = _.indexOf(_.map(availableFunctions, e => e.name), input.function);
if (selectedFunctionPos == -1) { console.log({}); return; }

const selectedFunction = availableFunctions[selectedFunctionPos];
const isValidArgs = selectedFunction.validateArgs(input.args);
if (!isValidArgs) { console.log({}); return; }

FILEio.createPath(input.dump).then(async () => {

    // handle error, or wrong args
    // https://github.com/randytarampi/lwip [Documentation]
    const folder = `${input.dump}`

    if (input.url) { // single url present

        const urlResult = {};
        const fileName = `${path.parse(input.url).base}`;
        const fileExtention = `${fileName.split('.').pop()}`;
        urlResult['fname_we'] = `${Date.now()}.${fileExtention}`;
        urlResult['imageDump'] = `${folder}/${urlResult['fname_we']}`;
        input.urlResult = urlResult;

        await copyFileToLocal(input.url, urlResult.imageDump);
        if (fileExtention == 'png') {
            urlResult['imageDump'] = await convertPngToJpg(urlResult.imageDump, `${folder}/${Date.now()}`);
        }

        const response = await openImageWithLWIP(urlResult.imageDump);
        if (response) await padImage(response, input.args[0], input.args[1], input.args[2], input.args[3], input.args[4], urlResult.imageDump);

        if (input.quality) { await changeQualityOfImage(input.quality, urlResult.imageDump); }

        await FILEio.writeJSON(folder, input.resultFile, input);
        console.log(input);

    } else if (input.urls.length > 0) { // multiple urls present

        const urlsResult = { names: [], imageDumps: [] }; // will be removed from receiver, dont know why we need this blank element, but without this it will not work;
        input.urlsResult = urlsResult;

        for (let urlPos = 0; urlPos < input.urls.length; urlPos++) {

            const fileName = `${path.parse(input.urls[urlPos]).base}`;
            const fileExtention = `${fileName.split('.').pop()}`
            let fname_we = `${Date.now()}.${fileExtention}`;
            let fullPath = `${folder}/${fname_we}`;

            await copyFileToLocal(input.urls[urlPos], fullPath);
            if (fileExtention == 'png') {
                fullPath = await convertPngToJpg(fullPath, `${folder}/${Date.now()}`);
            }

            const response = await openImageWithLWIP(fullPath);
            if (response) await padImage(response, input.args[0], input.args[1], input.args[2], input.args[3], input.args[4], fullPath);

            if (input.quality) { await changeQualityOfImage(input.quality, fullPath); }

            input.urlsResult.names.push(fname_we);
            input.urlsResult.imageDumps.push(fullPath);

            await FILEio.writeJSON(folder, input.resultFile, input); // this line should be at the last because we are changing the object structure
        }

        console.log(input);

    } else console.log({}); // not url/urls present so just abort the operation

}).catch(console.error);

async function copyFileToLocal(filePath, dumpAt /* full path with file name and extention where you want to place image at */) {
    return new Promise((resolve, _) => fs.copyFile(filePath, dumpAt, () => resolve(dumpAt)));
}

async function openImageWithLWIP(imagePath) {
    return new Promise((resolve, _) => {
        LWIP.open(imagePath, async (err, image) => {
            if (err) resolve(null);
            resolve(image);
        });
    });
}

async function padImage(LWIPImageFile, left, top, right, bottom, bgColor, imagePath) {
    return new Promise((resolve, _) => {
        LWIPImageFile.batch().pad(left, top, right, bottom, bgColor)
            .writeFile(imagePath, async err => {
                if (err) { resolve(null); }
                resolve(true);
            });
    });
}

async function convertPngToJpg(fileWithExtention, dumpAtWithoutExtention) {
    return new Promise((resolve, reject) => {
        Jimp.read(fileWithExtention, function (err, image) {
            if (err) return reject(err.message);
            image.background(0xFFFFFFFF, (err, val) => {
                if (err) return reject(err.message);
                val.write(`${dumpAtWithoutExtention}.jpg`);
                resolve(`${dumpAtWithoutExtention}.jpg`);
            });
        });
    });
}

async function changeQualityOfImage(quality = 50, imagePath) {
    return await new Promise((resolve, reject) => {
        try {
            Jimp.read(imagePath, (err, val) => {
                if (err) resolve(false)
                val.quality(quality).write(imagePath);
                resolve(true);
            });
        } catch (e) { console.log('-->', e.message); }
    });
}