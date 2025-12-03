import type { ESLint, Linter } from "eslint";

type PluginRule = NonNullable<ESLint.Plugin["rules"]>[string];

declare const plugin: {
    meta: {
        name: string;
        version: string;
    };
    rules: {
        property: PluginRule;
        method: PluginRule;
    };
    configs: {
        "recommended-legacy": Linter.LegacyConfig<Linter.RulesRecord>;
        recommended: Linter.Config<Linter.RulesRecord>;
    };
};

export = plugin;
