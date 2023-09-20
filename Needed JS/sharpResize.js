const fs = require("fs");
const fetch = require('node-fetch');
const sharp = require("sharp");
const { toSystemPath } = require('../../../lib/core/path');

exports.getValue = async function (options) {
    let path_input = toSystemPath(this.parseRequired(this.parse(options.path_input), 'string', 'fs.exists: path is required.'))
    let path_output = toSystemPath(this.parseRequired(this.parse(options.path_output), 'string', 'fs.exists: path is required.'))

    let width = this.parse(options.width)
    let height = this.parse(options.height)
    let fit = this.parse(options.fit)
    let file_name = this.parse(options.file_name)

    let result = '';
    // const destinationImagePath = `uploads/temp_usr_upload/${srcImgName}.png`;    //where new image will be saved

    console.log("Before Resize")

    const resizeImage = async () => {
        console.log("Started Resize")
        const image = await sharp(path_input)
            .trim()
            .resize({
                width: 1000,
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0.0 }
            }
            )
            .trim()
            .median(3)
            .sharpen(100)
            .ensureAlpha(0)
            .toFile(path_output + "/resized-" + file_name);
        console.log(image);
        return image;
    };
    return await resizeImage();

    // const response = async () => {
    //     const res = await resizeImage;
    //     console.log("Response Running");
    //     return res;
    // };

    // return image;
    // return new Promise(resolve => resizeImage());
};