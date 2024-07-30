const mockErrorStack = `Error: An unexpected error occurred
    at functionC (/path/to/file.js:10:9)
    at functionB (/path/to/file.js:6:3)
    at functionA (/path/to/file.js:2:3)
    at Object.<anonymous> (/path/to/file.js:14:1)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:831:12)
    `;

const mockErrorTracker = {
  "Error message": [1720964158, 1720964168, 1720964178, 1720964188],
  "Error message 2": [1720964158, 1720964168, 1720964178, 1720964188],
  "Error message 3": [1720964158, 1720964168, 1720964178, 1720964188],
};
