const assert = require("assert");
const { exec } = require("child_process");
const path = require("path");

const { before, describe, it } = require("mocha");
const ESLint = require("eslint").ESLint;

const FIXTURES_DIR = path.resolve(path.join("tests", "fixtures"));
const ESLINT_BIN = path.resolve(path.join("node_modules", ".bin", "eslint"));

const runEslint = ({ cwd, targetFile }) => {
    return new Promise((resolve, reject) => {
        const opts = { cwd };
        exec(
            `${ESLINT_BIN} -f json "${targetFile}"`,
            opts,
            (error, stdout, stderr) => {
                // Log and reject on unexpected errors (errors with code set to 1 are expected
                // because we expect linting errors and warnings to be reported back by eslint).
                if (error && error.code !== 1) {
                    console.log(
                        "Got unexpected error on executing eslint",
                        error
                    );
                    if (stderr) {
                        console.log("stderr:\n", stderr);
                    }
                    reject(error);
                    return;
                }

                try {
                    resolve(JSON.parse(stdout));
                } catch (err) {
                    reject(err);
                }
            }
        );
    });
};

describe("eslint-flat-config", function () {
    before(function () {
        // Only run these integration tests while running on esling
        // versions that suppor the configType flat.
        if (ESLint.configType !== "flat") {
            this.skip();
        }
    });

    it("loads the expected no-unsanitized recommended config", async () => {
        const results = await runEslint({
            cwd: path.join(FIXTURES_DIR, "eslint-flat-config"),
            targetFile: "test.js",
        });

        const expectedResults = [
            {
                errorCount: 2,
                warningCount: 1,
                messages: [
                    { ruleId: "no-unsanitized/property", severity: 2 },
                    { ruleId: "no-unsanitized/method", severity: 2 },
                    { ruleId: "no-unsanitized/parsing_method", severity: 1 },
                ],
            },
        ];
        assert.deepEqual(
            results.map((result) => ({
                errorCount: result.errorCount,
                warningCount: result.warningCount,
                messages: result.messages.map(({ ruleId, severity }) => ({
                    ruleId,
                    severity,
                })),
            })),
            expectedResults,
            "Got the expected eslint errors and warnings"
        );
    });
});
