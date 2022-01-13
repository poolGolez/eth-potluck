const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const contractsDir = path.join(__dirname, 'contracts');
const buildDir = path.join(__dirname, 'build')

cleanBuildDirectory();
compileAllSourceFiles();
console.log("Successfully compiled!!!");

function cleanBuildDirectory() {
    if (fs.existsSync(buildDir)) {
        fs.emptyDirSync(buildDir)
        fs.rmdirSync(buildDir);
    }

    fs.ensureDirSync(buildDir);
}

function compileAllSourceFiles() {
    fs.readdir(contractsDir,(err, fileNames) => {
        if(err) {
            console.error(err);
        }

        fileNames.forEach((fileName) => {
            const filePath = path.join(contractsDir, fileName);
            if(fs.lstatSync(filePath).isFile()) {
                compileFilePath(filePath);
            }
        });
    });
}

function compileFilePath(srcPath) {
    // const file = fs.readFileSync(srcPath, 'utf-8');

    // var input = JSON.stringify({
    //     language: 'Solidity',
    //     sources: {
    //     'Potluck.sol': { content: file }
    //     },
    //     settings: {
    //     outputSelection: {
    //         '*': {
    //         '*': ['*']
    //         }
    //     }
    //     }
    // });


    // const compiled = solc.compile(input);
    // console.log(path.join(buildDir, 'compiled.json'));
    // fs.writeFileSync(path.join(buildDir, 'compiled.json'), compiled);
}
