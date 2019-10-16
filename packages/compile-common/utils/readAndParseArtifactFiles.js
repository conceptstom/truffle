const fse = require("fs-extra");
const path = require("path");

const readAndParseArtifactFiles = (sourceFiles, contracts_build_directory) => {
  let sourceFilesArtifacts = {};
  // Get all the source files and create an object out of them.
  sourceFiles.forEach(sourceFile => {
    sourceFilesArtifacts[sourceFile] = [];
  });
  // Get all the artifact files, and read them, parsing them as JSON
  let buildFiles;
  try {
    buildFiles = fse.readdirSync(contracts_build_directory);
  } catch (error) {
    // The build directory may not always exist.
    if (error.message.includes("ENOENT: no such file or directory")) {
      // Ignore it.
      buildFiles = [];
    } else {
      throw error;
    }
  }

  buildFiles = buildFiles.filter(file => path.extname(file) === ".json");
  const jsonData = buildFiles.map(file => {
    const body = fse.readFileSync(
      path.join(contracts_build_directory, file),
      "utf8"
    );
    return { file, body };
  });

  jsonData.forEach(({ body, file }) => {
    try {
      const data = JSON.parse(body);

      // In case there are artifacts from other source locations.
      if (sourceFilesArtifacts[data.sourcePath] == null) {
        sourceFilesArtifacts[data.sourcePath] = [];
      }

      sourceFilesArtifacts[data.sourcePath].push(data);
    } catch (error) {
      // JSON.parse throws SyntaxError objects
      if (e instanceof SyntaxError) {
        throw new Error(`Problem parsing artifact: ${file}`);
      } else {
        throw error;
      }
    }
  });
  return sourceFilesArtifacts;
};

module.exports = readAndParseArtifactFiles;