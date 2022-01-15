const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const contractsDir = path.join(__dirname, 'contracts');
const buildDir = path.join(__dirname, 'build')

cleanBuildDirectory();
compileAllSourceFiles();
console.log("Compilation success!");

function cleanBuildDirectory() {
    if (fs.existsSync(buildDir)) {
        fs.emptyDirSync(buildDir)
        fs.rmdirSync(buildDir);
    }

    fs.ensureDirSync(buildDir);
}

function compileAllSourceFiles() {
    var input = JSON.stringify({
        language: 'Solidity',
        sources: getSourceCode(),
        settings: {
            outputSelection: {
                '*': {
                '*': ['*']
                }
            }
        }
    });

    const compiled = JSON.parse(solc.compile(input));
    Object.keys(compiled.contracts).forEach(fileName => {
        const compiledFile = compiled.contracts[fileName];
        Object.keys(compiledFile).forEach(contractName => {
            const compiledContract = compiledFile[contractName];
            const compiledContractPath = path.join(buildDir, `${contractName}.json`);

            fs.outputJSONSync(compiledContractPath, compiledContract);
        });


    });
}

function getSourceCode() {
    return fs.readdirSync(contractsDir, { withFileTypes: true, encoding: 'utf-8' })
            .filter(f => f.isFile())
            .reduce((result, f) => {
                return {
                    ...result,
                    [f.name]: {
                        content: fs.readFileSync(path.join(contractsDir, f.name), 'utf-8')
                    }
                } }, {});
}
