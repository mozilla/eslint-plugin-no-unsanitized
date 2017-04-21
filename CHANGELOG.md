# 2.0.0

- Renamed to `eslint-plugin-no-unsanitized` from `eslint-plugin-no-unsafe-innerhtml`
- Moved to be maintained by Mozilla
- Split single rule to `method` and `property` rule names 
- Added customization of properties and methods see README and SCHEMA
- Made breaking changes to permit customization
  - write and writeln method calls will now work on any object that has a case insensitive "document" string in it's var name
