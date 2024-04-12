const fs = require("fs");
const JavaScriptObfuscator = require('javascript-obfuscator');
class Index {
    constructor() {
        this.obf = true;
        this.Fileslist = this.getFiles("./web");
        console.log("Files to obfuscate: ", this.Fileslist);
        this.Obfuscate();
    }

    async Obfuscate() {
        if (fs.existsSync("./app")) fs.rmSync("./app", { recursive: true });

        for (let path of this.Fileslist) {
            let fileName = path.split('/').pop();
            let extFile = fileName.split(".").pop();
            let folder = path.replace(`/${fileName}`, '').replace('web', 'app');

            if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

            if (extFile == 'js') {
                let code = fs.readFileSync(path, "utf8");
                code = code.replace(/web\//g, 'app/');
                if (this.obf) {
                    let obf = JavaScriptObfuscator.obfuscate(code, { optionsPreset: 'medium-obfuscation', disableConsoleOutput: false });
                    fs.writeFileSync(`${folder}/${fileName}`, obf.getObfuscatedCode(), { encoding: "utf-8" });
                    console.log(`Obfuscated and wrote file: ${folder}/${fileName}`);
                } else {
                    fs.writeFileSync(`${folder}/${fileName}`, code, { encoding: "utf-8" });
                    console.log(`Wrote file without obfuscation: ${folder}/${fileName}`);
                }
            } else {
                fs.copyFileSync(path, `${folder}/${fileName}`);
                console.log(`Copied non-JS file: ${folder}/${fileName}`);
            }
        }
    }

    getFiles(path, file = []) {
        if (fs.existsSync(path)) {
            let files = fs.readdirSync(path);
            if (files.length == 0) file.push(path);
            for (let i in files) {
                let name = `${path}/${files[i]}`;
                if (fs.statSync(name).isDirectory()) this.getFiles(name, file);
                else file.push(name);
            }
        }
        return file;
    }
}

new Index();