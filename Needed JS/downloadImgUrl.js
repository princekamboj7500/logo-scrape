const fs = require('fs');
const axios = require('axios'); // you will need to install this
const { toSystemPath } = require('../../../lib/core/path');
const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;


exports.downloadImgUrl = async function (options) {

    //let url = options.url TESTING BELOW

    let url = this.parseRequired(options.url, 'string', 'URL is required'); // TESTING 03-19-22



    // const srcImgPath = options.path;  //image path on the server
    const srcImgName = this.parse(options.img_name);

    // BELOW WORKS BUT NEEDS SHORTER SRC NAME NOT WORK WITH LONG NAME
    const destinationImagePath = `uploads/temp_usr_upload/${srcImgName}.png`;    //where new image will be saved

    var dir = 'uploads/temp_usr_upload'; // checking if directory exists, otherwise create new
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    let path = toSystemPath(this.parseRequired(this.parse(options.path), 'string', 'fs.exists: path is required.'))
    let srcPath = fs.createReadStream(path);
    async function downloadImage(url, path) {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        return new Promise((resolve, reject) => {
            response.data.pipe(fs.createWriteStream(destinationImagePath))
                .on('error', reject)
                .once('close', () => resolve(destinationImagePath));
        });
    }

    return await downloadImage(url, path);

}