const {parse} = require("csv-parse");
const {stringify} = require("csv-stringify");
const fs = require("fs");
const { program } = require('commander');

program
    .requiredOption('-i, --input <input>', 'input file')
    .requiredOption('-o, --output <output>', 'output file')
    
program.parse(process.argv);

const options = program.opts();

const parser = parse({
    delimiter: "\t", 
    columns: true,
    relax_quotes: true,
});

const outputColumns = [
    "barcode",
    "name",
    "releaseArea",
    "conditionClassification",
    "userId",
    "sourceId",
    "originalName"
];

const stringifier = stringify({ 
    header: true, 
    columns: outputColumns, 
    delimiter: "\t"
});

const userId = "";

const getReleaseArea = (releaseArea) => {
    if (releaseArea === "Nordic") return "Nordic Countries";
    return releaseArea;
};

const conditionClassificationMap = {
    "Excellent": "Mint",
    "Fair": "Fair",
    "Good": "Good",
    "Bad - Damaged": "Bad",
    "Poor - Slightly Damaged": "Poor",
    "Still Wrapped": "New"
};

const getCondition = (condition) => conditionClassificationMap[condition];

fs.createReadStream(options.input)
    .pipe(parser)
    .on("data", (data) => {
        const barcode = data["Barcode"];
        if (barcode === undefined || barcode.trim() === "" || barcode === "0") {
            console.log("No barcode found", data);
            return;
        }
        const outputData = {
            barcode: data["Barcode"],
            name: data["Local title"],
            releaseArea: getReleaseArea(data["Country"]),
            conditionClassification: getCondition(data["Condition"]),
            userId,
            sourceId: data["Export Id"],
            originalName: data["Original title"]
        };
        stringifier.write(outputData);
    });

stringifier.pipe(fs.createWriteStream(options.output));
