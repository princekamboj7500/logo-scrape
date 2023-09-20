// 'use strict';
const fs = require('fs');
const { toSystemPath } = require('../../../lib/core/path');

exports.getValue = function (options) {
    let path = toSystemPath(this.parseRequired(this.parse(options.path), 'string', 'fs.exists: path is required.'))
    // if (fs.existsSync(path)) return path;
    // else return 'no';
    console.log("RUNNING")
    let data = this.parse(options.base64);
    let imgname = this.parse(options.imgname);

    let buff = new Buffer(data, 'base64');
    let img = fs.writeFileSync('public/user_design_images/' + imgname + '.png', buff);

    console.log('Base64 image data converted to file');
    console.log(img);

    // return imageToBase64(path);
};





