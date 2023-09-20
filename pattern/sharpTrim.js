const fs = require("fs");
const sharp = require("sharp");
const { toSystemPath } = require('../../../lib/core/path');

exports.getValue = function (options) {
    let path_input = toSystemPath(this.parseRequired(this.parse(options.path_input), 'string', 'fs.exists: path is required.'))
    let path_output = toSystemPath(this.parseRequired(this.parse(options.path_output), 'string', 'fs.exists: path is required.'))

    let file_name = this.parse(options.file_name)
    // const destinationImagePath = `uploads/temp_usr_upload/${srcImgName}.png`;    //where new image will be saved

    console.log("Before Trim")

    const trimImage = async () => {
        console.log("Started Trim")
        const image = await sharp(path_input)
            .trim()
            .toFile(path_output + "/trimed-" + file_name);

    };
    trimImage();

};