const mkdirp = require('mkdirp');
const fs = require('fs');

class FileIO {

    static async read(path, file, cb) {
        fs.readFile(`${path}/${file}`, { encoding: 'utf-8' }, cb);
    }

    static async writeText(path, file, text) {
        await this.createPath(`${path}`);
        fs.writeFileSync(`${path}/${file}`, text, { encoding: 'utf-8' });
    }

    static async writeJSON(path, file, object) {
        await this.createPath(`${path}`);
        fs.writeFileSync(`${path}/${file}`, JSON.stringify(object), { encoding: 'utf-8' });
    }

    static async createPath(path) {
        if (!fs.existsSync(path)) await mkdirp(path);
    }

    static async deleteFile(path, file) {
        fs.unlink(`${path}/${file}`, () => { });
    }

    static async isFileExits(file) {
        return fs.existsSync(file)
    }

}

module.exports = FileIO;