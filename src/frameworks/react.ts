import { Framework } from "./base";
import { LanguageId } from "~/utils";

class ReactFramework extends Framework {
  id = "react";
  display = "React";

  detection = {
    packageJSON: ["react-i18next", "react-intl", "next-i18next"],
  };

  languageIds: LanguageId[] = [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact",
    "ejs",
  ];

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    // general jsx attrs
    "[^\\w\\d](?:i18nKey=|FormattedMessage[ (]\\s*id=|t\\(\\s*)['\"`]({key})['\"`]",
    // useIntl() hooks, https://github.com/formatjs/react-intl/blob/master/docs/API.md#useintl-hook
    "[^\\w\\d](?:formatPlural|formatNumber|formatDate|formatTime|formatHTMLMessage|formatMessage|formatRelativeTime)\\(.*?['\"`]?id['\"`]?:\\s*['\"`]({key})['\"`]",
    "<Trans>({key})<\\/Trans>",
  ];

  refactorTemplates(keypath: string) {
    return [
      `{i18n.t('${keypath}')}`,
      `i18n.t('${keypath}')`,
      `{t('${keypath}')}`,
      `t('${keypath}')`,
      keypath,
    ];
  }
}

export default ReactFramework;
