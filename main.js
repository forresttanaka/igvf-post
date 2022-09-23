const { program } = require("commander");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");

/**
 * Convert a user key and secret assigned to them on an encoded site to an authorization string for
 * XHR requests.
 * @param {string} key Authorization key from encoded
 * @param {string} secret Authorization secret from encoded
 * @return {string} Authorization string; use in XHR request headers.
 */
function keypairToAuth(key, secret) {
  return `Basic ${Buffer.from(
    unescape(encodeURIComponent(`${key}:${secret}`))
  ).toString("base64")}`;
}

/**
 * Convert the contents of a TSV file to an array of objects. The first line of the file has the
 * property names, and the cells under each indicate the corresponding values for each object.
 * Array properties have '-array' appended to their property name, and the values are comma
 * separated. Date properties have '-date' appended to their property name, and the values can have
 * any interpetable date format.
 * @param {string} tsv Contents of a TSV file
 * @returns {array} Objects with keys and values from the TSV file
 */
function tsvToObjects(tsv) {
  const lines = tsv.split("\n");
  const rawProperties = lines[0].split("\t");
  const properties = rawProperties.map((property) =>
    property.replace(/[^a-zA-Z0-9_-]/g, "")
  );

  // One object per line.
  const objects = lines.slice(1).map((line) => {
    const rawValues = line.split("\t");
    // Remove non alphanumeric characters from values.
    const values = rawValues.map((value) => value.replace("\r", ""));

    // Build an object from the values on a single line.
    return properties.reduce((object, property, index) => {
      if (values[index]) {
        // If the property has a dash, get the type after the dash.
        const propertyType = property.split("-")[1];
        if (propertyType === "array") {
          const propertyName = property.split("-")[0];
          object[propertyName] = values[index].split(",");
        } else if (propertyType === "date") {
          const propertyName = property.split("-")[0];
          const normalDate = new Date(values[index]);
          object[propertyName] = normalDate.toISOString().split("T")[0];
        } else if (propertyType === "number") {
          const propertyName = property.split("-")[0];
          object[propertyName] = Number(values[index]);
        } else {
          object[property] = values[index];
        }
      }
      return object;
    }, {});
  });
  return objects;
}

/**
 * Posts the array of objects to the igvfd database.
 * @param {array}} objects Objects to be posted to igvfd
 */
async function postObjects(objects, host, collection) {
  console.log(
    "Posting objects to igvfd host %s collection %s",
    host,
    collection
  );
  for (const object of objects) {
    const response = await fetch(`${host}/${collection}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(object),
    });
    if (response.ok) {
      console.log("Success");
    } else {
      const reply = await response.json();
      console.log("Failure %o", JSON.stringify(reply, null, 2));
    }
  }
}

program
  .version("1.0.0")
  .option("-f, --keyfile [filename]", "keyfile name/path", "keypairs.json")
  .option("-k, --key [key]", "key of keyfile", "localhost")
  .option("-c, --collection [collection]", "collection name (plural)", "awards")
  .option("-t, --tsv [tsv]", "tsv file containing objects", "awards.tsv");
program.parse();
const options = program.opts();

const keyFileData = fs.readFileSync(
  path.resolve(__dirname, options.keyfile),
  "utf8"
);
const keyFile = JSON.parse(keyFileData);
const data = fs.readFileSync(path.resolve(__dirname, options.tsv), "utf8");
const objects = tsvToObjects(data);
const auth = keypairToAuth(
  keyFile[options.key].key,
  keyFile[options.key].secret
);

postObjects(objects, keyFile[options.key].server, options.collection).then(
  () => {
    console.log("Done");
  }
);
