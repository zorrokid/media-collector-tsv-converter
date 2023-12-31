const {parse} = require("csv-parse");
const fs = require("fs");

const parser = parse({delimiter: "\t", columns: true});

fs.createReadStream("data/source.tsv")
    .pipe(parser)
    .on("data", (data) => {
        console.log(data);
    });
