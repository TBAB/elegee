{
  "git.autofetch": true,
  "git.confirmSync": false,
  "vetur.ignoreProjectWarning": true,
  "eslint.codeAction.disableRuleComment": {
      "source.fixAll.eslint": "true",
      "eslint.autoFixOnSave": "true"
  },
  "files.autoSave": "onFocusChange",
  "editor.renderIndentGuides": false,
  "editor.suggestSelection": "first",
  "vsintellicode.modify.editor.suggestSelection": "automaticallyOverrodeDefaultValue",
  "editor.fontLigatures": null,
  "workbench.startupEditor": "newUntitledFile",
  "html.format.enable": false,
  "[vue]": {
      "editor.defaultFormatter": "octref.vetur"
  },
  "editor.formatOnSave": true, // eslint保存格式化
  "javascript.format.enable": false, // 不启动JavaScript格式化
  "editor.codeActionsOnSave":  { "source.organizeImports": true }, // 让prettier遵循eslint格式美化
  // #让vue中的js按"prettier"格式进行格式化
  "vetur.validation.template": false,
  "vetur.format.defaultFormatter.html": "js-beautify-html",
  "vetur.format.defaultFormatter.js": "prettier",
  "vetur.format.defaultFormatterOptions": {
      "js-beautify-html": {
          // #vue组件中html代码格式化样式
          "wrap_attributes": "force-aligned", //也可以设置为“auto”，效果会不一样
          "wrap_line_length": 200,
          "end_with_newline": false,
          "semi": false,
          "singleQuote": true
      },
      "prettier": {
          "semi": false,
          "singleQuote": true
      }
  }
}