const fs = require('fs');
const args = process.argv;
console.log(args);


fs.mkdir('./src/routes/' + args[2], (err) => {
    if (err) {
        if (err.code === 'EEXIST') {
        console.error('myfile already exists');
        return;
        } 
        throw err;
    }
});

const location = './src/routes/' + args[2] + '/';
const files = ['-model.ts', '-api.ts', '-handler.ts']

files.forEach(element => {
    fs.writeFile(location + args[2] + element ,"",function (err) {
        if (err) throw err;
        console.log("Saved!");
    });
});
