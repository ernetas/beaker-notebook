/*
 *  Copyright 2014 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
(function() {
  "use strict";

  var publishToWeb = function(scope) {
    bkHelper.showStatus('Sharing to Web');
    bkHelper.httpPost("../beaker/rest/publish/github", {
      type: "notebook",
      json: angular.toJson(scope.getShareData())
    })
    .success(function(reply) {
      bkHelper.clearStatus('Sharing to Web');
      window.open(reply);
    })
    .error(function(msg) {
      bkHelper.clearStatus('Sharing to Web');
      bkHelper.show1ButtonModal(msg, "Publish Failed");
    });
  };

  window.beaker.getEvaluatorUrlMap = function() {
    return {
      "IPython": { url : "./plugins/eval/ipythonPlugins/ipython/ipython.js", bgColor: "#EEBD48", fgColor: "#FFFFFF", borderColor: "", shortName: "Py" },
      "Python3": { url : "./plugins/eval/ipythonPlugins/python3/python3.js", bgColor: "#EEBD48", fgColor: "#FFFFFF", borderColor: "", shortName: "Py" },
      // "IRuby": { url : "./plugins/eval/ipythonPlugins/iruby/iruby.js", bgColor: "#AF1712", fgColor: "#FFFFFF", borderColor: "", shortName: "Rb" },
      "Julia": { url : "./plugins/eval/ipythonPlugins/julia/julia.js", bgColor: "#6EAC5E", fgColor: "#FFFFFF", borderColor: "", shortName: "Jl" },
      "Groovy": { url : "./plugins/eval/groovy/groovy.js", bgColor: "#6497A9", fgColor: "#FFFFFF", borderColor: "", shortName: "Gv" },
      "Java": { url : "./plugins/eval/javash/javash.js", bgColor: "#EB0000", fgColor: "#FFFFFF", borderColor: "", shortName: "Jv" },
      "R": { url : "./plugins/eval/r/r.js", bgColor: "#8495BB", fgColor: "#FFFFFF", borderColor: "", shortName: "R" },
      "Scala": { url : "./plugins/eval/scala/scala.js", bgColor: "#B41703", fgColor: "#FFFFFF", borderColor: "", shortName: "Sc" },
      "Node": { url : "./plugins/eval/node/node.js", bgColor: "#8EC453", fgColor: "#FFFFFF", borderColor: "", shortName: "N" }
    };
  };

  window.beaker.getCellMenuList = function () {
    return [
            {
              cellType: ["notebook", "section", "code"],
              plugin: {
                name: "public web...",
                tooltip: "using an anonymous github gist",
                action: function() {
                  publishToWeb(scope);
                }
              }
            }
            ];
  };

  window.beaker.getMenuItems = function() {
    var menuItems = [
                     {
                       name: "Language manager...",
                       sortorder: 100,
                       action: function () {
                         bkHelper.showLanguageManager();
                       },
                       tooltip: "Show available languages and edit their settings",
                       id: "language-manager-menuitem"
                     },
                     {
                       name: "Lock",
                       sortorder: 110,
                       action: function () {
                         bkHelper.toggleNotebookLocked();
                       },
                       tooltip: "Lock notebook from further editing",
                       isChecked: function () {
                         return bkHelper.isNotebookLocked();
                       },
                       id: "lock-menuitem"
                     },
                     {
                       name: 'Delete all output cells',
                       sortorder: 120,
                       action: function () {
                         bkHelper.deleteAllOutputCells();
                       },
                       tooltip: 'Deletes all of the output cells.',
                       id: "delete-all-menuitem"
                     },
                     {
                       name: "Run all cells",
                       sortorder: 130,
                       action: function() {
                         bkHelper.evaluateRoot("root");
                       },
                       tooltip: "Run all cells",
                       id: "run-all-cells-menuitem"
                     },
                     {
                       name: 'Collapse All Sections',
                       sortorder: 135,
                       action: bkHelper.collapseAllSections,
                       id: "collapse-all-menuitem"
                     },
                     {
                       name: "Edit mode",
                       sortorder: 140,
                       id: "edit-mode-menuitem"
                     }
                     ];
    var toAdd = [
                 {
                   parent: "Notebook",
                   id: "notebook-menu",
                   items: menuItems
                 },
                 {
                   parent: "Notebook",
                   submenu: "Edit mode",
                   id: "edit-mode-menuitem",
                   items: [
                           {
                             name: "Normal",
                             sortorder: 100,
                             id: "normal-edit-mode-menuitem",
                             isChecked: function () {
                               return bkHelper.getInputCellKeyMapMode() === "default";
                             },
                             action: function () {
                               bkHelper.setInputCellKeyMapMode("default");
                             }
                           },
                           {
                             name: "Vim",
                             sortorder: 120,
                             id: "vim-edit-mode-menuitem",
                             isChecked: function () {
                               return bkHelper.getInputCellKeyMapMode() === "vim";
                             },
                             action: function () {
                               bkHelper.setInputCellKeyMapMode("vim");
                             }
                           },
                           {
                             name: "Emacs",
                             sortorder: 110,
                             id: "emacs-edit-mode-menuitem",
                             isChecked: function () {
                               return bkHelper.getInputCellKeyMapMode() === "emacs";
                             },
                             action: function () {
                               bkHelper.setInputCellKeyMapMode("emacs");
                             }
                           }
                           ]
                 }
                 ];
    return toAdd;
  };

})();