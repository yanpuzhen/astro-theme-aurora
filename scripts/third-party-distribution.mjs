/**
 * Explicit comment-resource redistribution audit. Versions are artifact-derived.
 * A license source version is not a claim about an unversioned embedded component.
 * Declaration-only upstream packages retain original metadata and clearly marked
 * normative license reference text; no missing copyright holder is invented.
 * This engineering inventory does not make legal compatibility conclusions.
 */
export const distributionInventory = Object.freeze([
  {
    "name": "wasm-bindgen",
    "version": "0.2.100",
    "license": "MIT OR Apache-2.0",
    "origin": "Cap WASM binding runtime support (conservative coverage of pinned runtime crates)",
    "evidence": "@cap.js/wasm published rust/Cargo.toml and Cargo.lock; build-only macro/compiler crates excluded",
    "licenseSources": [
      "scripts/third-party-licenses/wasm-bindgen-0.2.100/LICENSE-APACHE",
      "scripts/third-party-licenses/wasm-bindgen-0.2.100/LICENSE-MIT"
    ],
    "licenseProvenance": "official crates.io wasm-bindgen@0.2.100 source archive"
  },
  {
    "name": "cfg-if",
    "version": "1.0.4",
    "license": "MIT OR Apache-2.0",
    "origin": "Cap WASM binding runtime support (conservative coverage of pinned runtime crates)",
    "evidence": "@cap.js/wasm published rust/Cargo.toml and Cargo.lock; build-only macro/compiler crates excluded",
    "licenseSources": [
      "scripts/third-party-licenses/cfg-if-1.0.4/LICENSE-APACHE",
      "scripts/third-party-licenses/cfg-if-1.0.4/LICENSE-MIT"
    ],
    "licenseProvenance": "official crates.io cfg-if@1.0.4 source archive"
  },
  {
    "name": "once_cell",
    "version": "1.21.4",
    "license": "MIT OR Apache-2.0",
    "origin": "Cap WASM binding runtime support (conservative coverage of pinned runtime crates)",
    "evidence": "@cap.js/wasm published rust/Cargo.toml and Cargo.lock; build-only macro/compiler crates excluded",
    "licenseSources": [
      "scripts/third-party-licenses/once_cell-1.21.4/LICENSE-APACHE",
      "scripts/third-party-licenses/once_cell-1.21.4/LICENSE-MIT"
    ],
    "licenseProvenance": "official crates.io once_cell@1.21.4 source archive"
  },
  {
    "name": "webpack runtime/bootstrap helpers",
    "version": null,
    "license": "MIT",
    "origin": "compiler-emitted helper material in Valine, LeanCloud and CloudBase prebundles",
    "evidence": "published source maps identify webpack/bootstrap, universalModuleDefinition and (webpack)/buildin/global.js/module.js; compiler versions are not asserted",
    "licenseProvenance": "official webpack 3.11.0 license text; license-source release does not identify the embedded runtime version",
    "licenseSources": [
      "scripts/third-party-licenses/webpack--license-from-3.11.0/LICENSE"
    ]
  },
  {
    "name": "@cap.js/wasm",
    "version": "0.0.8",
    "license": "Apache-2.0",
    "origin": "copied local Twikoo CAPTCHA runtime",
    "evidence": "Aurora-pinned package WASM files",
    "licenseSources": [
      "node_modules/@cap.js/widget/LICENSE"
    ]
  },
  {
    "name": "@cap.js/widget",
    "version": "0.1.58",
    "license": "Apache-2.0",
    "origin": "copied local Twikoo CAPTCHA runtime",
    "evidence": "Aurora-pinned package copied and URL-patched",
    "licenseSources": [
      "node_modules/@cap.js/widget/LICENSE"
    ]
  },
  {
    "name": "@cloudbase/adapter-interface",
    "version": "0.7.1",
    "license": "ISC",
    "origin": "embedded in Twikoo 2.0.8 all/CloudBase distribution",
    "evidence": "Twikoo 2.0.8 tag 47cb229 release imports and pnpm lock; CloudBase app/auth/functions/storage maps identify external runtime imports",
    "licenseProvenance": "npm @cloudbase/adapter-interface@0.7.1",
    "licenseSources": [
      "scripts/third-party-licenses/@cloudbase__adapter-interface--license-from-0.7.1/package.json",
      "scripts/third-party-licenses/declared-license-reference/ISC.txt",
      "scripts/third-party-licenses/declared-license-reference/README.txt"
    ],
    "upstreamLicenseTextSupplied": false
  },
  {
    "name": "@cloudbase/adapter-wx_mp",
    "version": "1.3.1",
    "license": "ISC",
    "origin": "embedded in Twikoo 2.0.8 all/CloudBase distribution",
    "evidence": "Twikoo 2.0.8 tag 47cb229 release imports and pnpm lock; CloudBase app/auth/functions/storage maps identify external runtime imports",
    "licenseProvenance": "npm @cloudbase/adapter-wx_mp@1.3.1",
    "licenseSources": [
      "scripts/third-party-licenses/@cloudbase__adapter-wx_mp--license-from-1.3.1/package.json",
      "scripts/third-party-licenses/declared-license-reference/ISC.txt",
      "scripts/third-party-licenses/declared-license-reference/README.txt"
    ],
    "upstreamLicenseTextSupplied": false
  },
  {
    "name": "@cloudbase/js-sdk",
    "version": "3.10.0",
    "license": "Apache-2.0",
    "origin": "embedded in Twikoo 2.0.8 all/CloudBase distribution",
    "evidence": "Twikoo all-client source import, bundle version marker, and Twikoo 2.0.8 release lock",
    "licenseSources": [
      "scripts/third-party-licenses/@cloudbase__js-sdk--license-from-3.10.0/LICENSE"
    ]
  },
  {
    "name": "@fortawesome/fontawesome-free",
    "version": "7.3.1",
    "license": "(CC-BY-4.0 AND OFL-1.1 AND MIT)",
    "origin": "SVG icon material embedded in Twikoo 2.0.8 distribution",
    "evidence": "Twikoo icon source imports and Twikoo 2.0.8 release lock",
    "licenseSources": [
      "node_modules/@fortawesome/fontawesome-free/LICENSE.txt"
    ]
  },
  {
    "name": "@twikoojs/shared",
    "version": "2.0.8",
    "license": "MIT",
    "origin": "embedded in Twikoo 2.0.8 distribution",
    "evidence": "Twikoo package manifest and published bundle banner",
    "licenseSources": [
      "scripts/third-party-licenses/twikoo-shared-2.0.8/LICENSE"
    ]
  },
  {
    "name": "@vueuse/core",
    "version": "14.3.0",
    "license": "MIT",
    "origin": "embedded in @waline/client 3.15.2 distribution",
    "evidence": "published waline.js.map versioned source path",
    "licenseSources": [
      "scripts/third-party-licenses/vueuse-14.3.0/LICENSE"
    ]
  },
  {
    "name": "@vueuse/shared",
    "version": "14.3.0",
    "license": "MIT",
    "origin": "embedded in @waline/client 3.15.2 distribution",
    "evidence": "published waline.js.map versioned source path",
    "licenseSources": [
      "scripts/third-party-licenses/vueuse-shared-14.3.0/LICENSE"
    ]
  },
  {
    "name": "@waline/api",
    "version": "1.1.2",
    "license": "MIT",
    "origin": "embedded in @waline/client 3.15.2 distribution",
    "evidence": "Waline package dependency and API sources in published source map",
    "licenseSources": [
      "scripts/third-party-licenses/@waline__api--license-from-1.1.2/LICENSE"
    ]
  },
  {
    "name": "@waline/client",
    "version": "3.15.2",
    "license": "MIT",
    "origin": "Aurora local Waline chunk from published prebuilt module",
    "evidence": "installed published package",
    "licenseSources": [
      "node_modules/@waline/client/LICENSE"
    ]
  },
  {
    "name": "autosize",
    "version": "6.0.1",
    "license": "MIT",
    "origin": "embedded in @waline/client 3.15.2 distribution",
    "evidence": "published waline.js.map versioned source path",
    "licenseSources": [
      "scripts/third-party-licenses/autosize--license-from-6.0.1/LICENSE.md"
    ]
  },
  {
    "name": "autosize",
    "version": "4.0.2",
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; preserved upstream version banner",
    "licenseProvenance": "autosize@4.0.2 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/autosize--license-from-4.0.2/LICENSE.md"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/autosize/",
    "sourceHash": "3702a2283fc3d891a0624f278e647c428c29a0e4cdcf2dbd1c994b2da789f004"
  },
  {
    "name": "balajs",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "balajs@1.0.7 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/balajs--license-from-1.0.7/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/balajs/",
    "sourceHash": "76c9b1b07ca4ac3703fda67bf675247e1de5467138842752bd6690ea6e812a38"
  },
  {
    "name": "blueimp-md5",
    "version": "2.19.0",
    "license": "MIT",
    "origin": "embedded in Twikoo 2.0.8 all/CloudBase distribution",
    "evidence": "Twikoo 2.0.8 tag 47cb229 release imports and pnpm lock; CloudBase app/auth/functions/storage maps identify external runtime imports",
    "licenseProvenance": "npm blueimp-md5@2.19.0",
    "licenseSources": [
      "scripts/third-party-licenses/blueimp-md5--license-from-2.19.0/LICENSE.txt"
    ]
  },
  {
    "name": "blueimp-md5",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "blueimp-md5@2.19.0 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/blueimp-md5--license-from-2.19.0/LICENSE.txt"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/blueimp-md5/",
    "sourceHash": "e0e77a0cc2d6a907deecb28c8224cfaa4263de6b7d63875402604af6b25fc7e5"
  },
  {
    "name": "charenc",
    "version": null,
    "license": "BSD-3-Clause",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "charenc@0.0.2 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/charenc--license-from-0.0.2/LICENSE.mkd"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/charenc/",
    "sourceHash": "59e665fa92bfab5d3bcc4dbe24c3d59b4363b3daf2ef3936a7c1e5161580c69e"
  },
  {
    "name": "comment-regex",
    "version": null,
    "license": "MIT",
    "origin": "embedded in hanabi inside Valine",
    "evidence": "hanabi source map contains comment.line/comment.block implementation; hanabi package release dependency; exact version not stated",
    "licenseSources": [
      "scripts/third-party-licenses/comment-regex-embedded/LICENSE"
    ],
    "licenseProvenance": "official comment-regex v1.0.0 tag license"
  },
  {
    "name": "component-emitter",
    "version": null,
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "component-emitter@1.3.1 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/component-emitter--license-from-1.3.1/LICENSE"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/component-emitter/",
    "sourceHash": "01ea5bd586498307a7b343e8367ed948001efb2c18db3ae1d7963e41f96c0555"
  },
  {
    "name": "crypt",
    "version": null,
    "license": "BSD-3-Clause",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "crypt@0.0.2 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/crypt--license-from-0.0.2/LICENSE.mkd"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/crypt/",
    "sourceHash": "2a1f4c082a60e9a5c05f2dc24f628aa3dba03aa459152431d80522586164a753"
  },
  {
    "name": "css-loader",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "css-loader@3.5.3 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/css-loader--license-from-3.5.3/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/css-loader/",
    "sourceHash": "5e258b9d1e441651126984434126ba866a5234902cd9163142438a3acd384fdc"
  },
  {
    "name": "cssfilter",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "cssfilter@0.0.10 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/cssfilter--license-from-0.0.10/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/cssfilter/",
    "sourceHash": "e7e0afa38db209b61c9fc5f0d3b05671a7612aa117365bfe4589dee8117a48cc"
  },
  {
    "name": "debug",
    "version": null,
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "debug@3.1.0 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/debug--license-from-3.1.0/LICENSE"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/debug/",
    "sourceHash": "6447571db9a07ddcba8b9616be7d5d187f3360b317807d421f5bb66bb8c544e3"
  },
  {
    "name": "define-properties",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "define-properties@1.1.3 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/define-properties--license-from-1.1.3/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/define-properties/",
    "sourceHash": "a44fcfe4efd1356ba06493edc04c590bd46272a590c6e82def6813fb7c7f5b0e"
  },
  {
    "name": "DOMPurify",
    "version": "3.4.15",
    "license": "(MPL-2.0 OR Apache-2.0)",
    "origin": "embedded in Twikoo 2.0.8 distribution",
    "evidence": "runtime t.version marker in both shipped Twikoo bundles and Twikoo 2.0.8 release lock",
    "licenseSources": [
      "scripts/third-party-licenses/dompurify-3.4.15/LICENSE"
    ]
  },
  {
    "name": "es-abstract",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "es-abstract@1.17.5 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/es-abstract--license-from-1.17.5/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/es-abstract/",
    "sourceHash": "73eaab8d033b35a92b4b128ca2c8b5d3df77d66ea83b378624dabc8ce738ea12"
  },
  {
    "name": "es6-promise",
    "version": "4.2.3",
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; preserved upstream version banner",
    "licenseProvenance": "es6-promise@4.2.3 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/es6-promise--license-from-4.2.3/LICENSE"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/es6-promise/",
    "sourceHash": "0c3adc973a4f282ec4b1ada7025ed155ef681e335735ea25de112779e2bbd42d"
  },
  {
    "name": "eventemitter3",
    "version": null,
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "eventemitter3@2.0.3 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/eventemitter3--license-from-2.0.3/LICENSE"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/eventemitter3/",
    "sourceHash": "e54a4a5efa6b00b6f6551a58c2ec03ea5b1430119695acb632ec8b21699025a0"
  },
  {
    "name": "for-each",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "for-each@0.3.3 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/for-each--license-from-0.3.3/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/for-each/",
    "sourceHash": "89eb217724b347177475d2521eb416387b658f03dcd4d0cbfbad818241c14410"
  },
  {
    "name": "function-bind",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "function-bind@1.1.1 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/function-bind--license-from-1.1.1/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/function-bind/",
    "sourceHash": "4bfd520c8cba79143ba8c0956e8ecc8baa1cbb4a7c660eaf231f3aa3bc5ada19"
  },
  {
    "name": "hanabi",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "hanabi@0.4.0 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/hanabi--license-from-0.4.0/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/hanabi/",
    "sourceHash": "477238a0edf5e7c7b9044d0e6b2a4fcbf5d70411a4d0057ae9394ed891b59931"
  },
  {
    "name": "has-symbols",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "has-symbols@1.0.1 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/has-symbols--license-from-1.0.1/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/has-symbols/",
    "sourceHash": "761b9d74a6acd093bc33b48a8104bacf450248d126fb6f814a82b56adfac460f"
  },
  {
    "name": "has",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "has@1.0.3 published license material; upstream tag v1.0.3 LICENSE-MIT; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/has-embedded/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/has/",
    "sourceHash": "579cb60b48ad1b503a40d1c519021decb6fad952875ec3d6fd8f6b92ba3ac619"
  },
  {
    "name": "hashwx",
    "version": "74b567a31276a4c5d7cb232a5b7639467f49f961",
    "license": "LGPL-3.0",
    "origin": "copied Cap hashwx.wasm",
    "evidence": "Cap upstream vendor commit and emitted SHA256 b1a0dbb3ef444d3c7069e0a5e0a0273ffa4cf8fef62cbbe43761c02f7cd6aff5 exactly match shipped WASM",
    "licenseSources": [
      "scripts/third-party-licenses/hashwx/LICENSE",
      "scripts/third-party-licenses/hashwx/COPYING-GPL-3.0.txt",
      "scripts/third-party-sources/hashwx-74b567a.tar.gz.b64"
    ],
    "licenseProvenance": "official tevador/hashwx pinned commit LICENSE and complete source archive; GNU GPL-3.0 companion text"
  },
  {
    "name": "is-buffer",
    "version": null,
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "is-buffer@1.1.6 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/is-buffer--license-from-1.1.6/LICENSE"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/is-buffer/",
    "sourceHash": "a86b66110a7bd4aeb8cb498ab7fdca36f7dc9a051de6b0d52bb1ae1793b62815"
  },
  {
    "name": "is-callable",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "is-callable@1.1.5 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/is-callable--license-from-1.1.5/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/is-callable/",
    "sourceHash": "99b4100d3b1fd3809d99c9fd38e4e23613788da4a9b4972fd7120eb6523ac2fe"
  },
  {
    "name": "js-sha256",
    "version": "1.0.0",
    "license": "MIT",
    "origin": "embedded in Twikoo 2.0.8 distribution",
    "evidence": "Twikoo client source imports plus Twikoo 2.0.8 release lock",
    "licenseSources": [
      "scripts/third-party-licenses/js-sha256-1.0.0/LICENSE.txt"
    ]
  },
  {
    "name": "JSEncrypt/jsbn/ASN.1 helper material",
    "version": "3.1.4",
    "license": "MIT AND ISC AND LicenseRef-jsbn",
    "origin": "embedded in Twikoo 2.0.8 all/CloudBase distribution",
    "evidence": "CloudBase auth source map ../oauth/src/utils/encryptlong/index.js, JSEncrypt.version = 3.1.4 and preserved Lapo Luchini/Tom Wu notices",
    "licenseSources": [
      "scripts/third-party-licenses/cloudbase-encryptlong/NOTICE.txt",
      "scripts/third-party-licenses/jsencrypt-v3.1.0/LICENSE.txt",
      "scripts/third-party-sources/cloudbase-encryptlong.js.txt"
    ],
    "licenseProvenance": "verbatim embedded copyright notices and source fork; upstream JSEncrypt v3.1.0 combined MIT/ASN.1/jsbn notices (license-source release does not identify the fork version)"
  },
  {
    "name": "jwt-decode",
    "version": "3.1.2",
    "license": "MIT",
    "origin": "embedded in Twikoo 2.0.8 all/CloudBase distribution",
    "evidence": "Twikoo 2.0.8 tag 47cb229 release imports and pnpm lock; CloudBase app/auth/functions/storage maps identify external runtime imports",
    "licenseProvenance": "npm jwt-decode@3.1.2",
    "licenseSources": [
      "scripts/third-party-licenses/jwt-decode--license-from-3.1.2/LICENSE"
    ]
  },
  {
    "name": "leancloud-storage",
    "version": "3.15.0",
    "license": "MIT",
    "origin": "Aurora local Valine chunk",
    "evidence": "direct source import bundled by Aurora from the frozen lock",
    "licenseSources": [
      "node_modules/leancloud-storage/LICENSE"
    ]
  },
  {
    "name": "localstorage-memory",
    "version": null,
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "localstorage-memory@1.0.3 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/localstorage-memory--license-from-1.0.3/package.json",
      "scripts/third-party-licenses/declared-license-reference/MIT.txt",
      "scripts/third-party-licenses/declared-license-reference/README.txt"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/localstorage-memory/",
    "sourceHash": "012124d1ae61d63eb9bfe523c8df98f72350a87649a495c2183da4bbe9cb5b6e",
    "upstreamLicenseTextSupplied": false
  },
  {
    "name": "marked-highlight",
    "version": "2.2.4",
    "license": "MIT",
    "origin": "embedded in @waline/client 3.15.2 distribution",
    "evidence": "published waline.js.map versioned source path",
    "licenseSources": [
      "scripts/third-party-licenses/marked-highlight--license-from-2.2.4/LICENSE"
    ]
  },
  {
    "name": "marked",
    "version": "18.0.4",
    "license": "MIT",
    "origin": "embedded in @waline/client 3.15.2 distribution",
    "evidence": "published waline.js.map versioned source path",
    "licenseSources": [
      "scripts/third-party-licenses/marked-18/LICENSE"
    ]
  },
  {
    "name": "marked",
    "version": "18.0.13",
    "license": "MIT",
    "origin": "embedded in Twikoo 2.0.8 distribution",
    "evidence": "Twikoo client source imports plus Twikoo 2.0.8 release lock",
    "licenseSources": [
      "scripts/third-party-licenses/marked-18.0.13/LICENSE"
    ]
  },
  {
    "name": "marked",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "marked@0.8.2 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/marked--license-from-0.8.2/LICENSE.md"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/marked/",
    "sourceHash": "8e658146a06803f2ab0eae46d3d638c7216d32d14dce15a9515731a3be7dc000"
  },
  {
    "name": "md5",
    "version": null,
    "license": "BSD-3-Clause",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "md5@2.3.0 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/md5--license-from-2.3.0/LICENSE"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/md5/",
    "sourceHash": "5c9ed958a418d9c33605c5e51f641fbe43be4cd8a7b436214cfdc8ef4a3b4360"
  },
  {
    "name": "Microsoft TypeScript emitted helpers",
    "version": null,
    "license": "Apache-2.0",
    "origin": "embedded in Twikoo 2.0.8 all/CloudBase distribution",
    "evidence": "CloudBase auth index.esm.js.LICENSE.txt and encryptlong source map preserve Microsoft copyright",
    "licenseSources": [
      "scripts/third-party-licenses/cloudbase-encryptlong/NOTICE.txt",
      "scripts/third-party-licenses/cloudbase-js-sdk-3.10.0/LICENSE"
    ]
  },
  {
    "name": "ms",
    "version": null,
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "ms@2.0.0 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/ms--license-from-2.0.0/license.md"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/ms/",
    "sourceHash": "b30bb938bc4b2952681d677dae39b70da29eb6dafe9a3c2f9db710587cd8db7a"
  },
  {
    "name": "node-polyglot",
    "version": null,
    "license": "BSD-2-Clause",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "node-polyglot@2.4.0 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/node-polyglot--license-from-2.4.0/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/node-polyglot/",
    "sourceHash": "7c5ae8300a3e1b9b6ce725ce187399c3512ce78b336b72d29c3167d568695ed7"
  },
  {
    "name": "object-assign",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "object-assign@4.1.1 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/object-assign--license-from-4.1.1/license"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/object-assign/",
    "sourceHash": "42c06d449bdb88ad97ce0697c770926f8d07bb6e5bc12de362f11e5b18334a6c"
  },
  {
    "name": "object-keys",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "object-keys@1.1.1 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/object-keys--license-from-1.1.1/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/object-keys/",
    "sourceHash": "b9099c4fb2341902ff6660edb5aae1325a2c2a236f57f2fd0066370f28400d37"
  },
  {
    "name": "pako",
    "version": "2.1.0",
    "license": "(MIT AND Zlib)",
    "origin": "copied local Cap fallback runtime",
    "evidence": "Aurora-pinned package copied for the Cap widget",
    "licenseSources": [
      "node_modules/pako/LICENSE"
    ]
  },
  {
    "name": "pow-buster adapted kernel",
    "version": null,
    "license": "Apache-2.0",
    "origin": "embedded in Cap cap_wasm_bg.wasm",
    "evidence": "@cap.js/wasm published rust/src/lib.rs attribution of multiway_arx",
    "licenseSources": [
      "scripts/third-party-licenses/pow-buster/LICENSE"
    ]
  },
  {
    "name": "prismjs",
    "version": "1.28.0",
    "license": "MIT",
    "origin": "copied local Twikoo runtime assets",
    "evidence": "Aurora-pinned package copied to the deployable Prism namespace",
    "licenseSources": [
      "node_modules/prismjs/LICENSE"
    ]
  },
  {
    "name": "prismjs",
    "version": "1.30.0",
    "license": "MIT",
    "origin": "embedded in Twikoo 2.0.8 all/CloudBase distribution",
    "evidence": "Twikoo 2.0.8 tag 47cb229 release imports and pnpm lock; CloudBase app/auth/functions/storage maps identify external runtime imports",
    "licenseProvenance": "npm prismjs@1.30.0",
    "licenseSources": [
      "scripts/third-party-licenses/prismjs--license-from-1.30.0/LICENSE"
    ]
  },
  {
    "name": "process",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "process@0.11.10 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/process--license-from-0.11.10/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/process/",
    "sourceHash": "027ac70fd1a3a6db6df76012815f31b51df6ad9d4fe31d3d83b5d582c1c23563"
  },
  {
    "name": "recaptcha-v3",
    "version": "1.11.3",
    "license": "Apache-2.0",
    "origin": "embedded in @waline/client 3.15.2 distribution",
    "evidence": "published waline.js.map versioned source path",
    "licenseSources": [
      "scripts/third-party-licenses/recaptcha-v3--license-from-1.11.3/LICENSE"
    ]
  },
  {
    "name": "string.prototype.trim",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "string.prototype.trim@1.2.1 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/string.prototype.trim--license-from-1.2.1/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/string.prototype.trim/",
    "sourceHash": "da18cc21a9195b26d83bf8e9e6727a1cf7eb06e44b334af33fc4a33655ab5ee3"
  },
  {
    "name": "style-loader",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "style-loader@0.18.2 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/style-loader--license-from-0.18.2/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/style-loader/",
    "sourceHash": "7c56c320da90466fcc78be22f8753f17a1cf8acc7aafd3596fbdba78ec26e9b6"
  },
  {
    "name": "superagent",
    "version": null,
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "superagent@3.8.3 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/superagent--license-from-3.8.3/LICENSE"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/superagent/",
    "sourceHash": "abfce3049fd792b6b1fbeb9dfe2fcf1ef288393d119a38a408b9f51cd70d89a5"
  },
  {
    "name": "twikoo",
    "version": "2.0.8",
    "license": "MIT",
    "origin": "copied prebuilt Twikoo distributions",
    "evidence": "published twikoo.min.js and twikoo.all.min.js",
    "licenseSources": [
      "node_modules/twikoo/LICENSE"
    ]
  },
  {
    "name": "underscore",
    "version": "1.9.1",
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; preserved upstream version banner",
    "licenseProvenance": "underscore@1.9.1 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/underscore--license-from-1.9.1/LICENSE"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/underscore/",
    "sourceHash": "f3073f4ed52f4a238ae3d33edf1071cc1df8b31416277e1fd3b27737230ef083"
  },
  {
    "name": "uuid",
    "version": null,
    "license": "MIT",
    "origin": "embedded in leancloud-storage published distribution",
    "evidence": "node_modules/leancloud-storage/dist/av-min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "uuid@3.3.2 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/uuid--license-from-3.3.2/LICENSE.md"
    ],
    "sourceMap": "node_modules/leancloud-storage/dist/av-min.js.map",
    "sourcePrefix": "webpack:///./node_modules/uuid/",
    "sourceHash": "2ecb7ba63014c02f14f2754185368089ca232521d32f21ec61016c31026d59c7"
  },
  {
    "name": "valine",
    "version": "1.5.3",
    "license": "GPL-2.0",
    "origin": "Aurora local Valine chunk",
    "evidence": "node_modules/valine/dist/Valine.min.js and its published source map",
    "licenseSources": [
      "node_modules/valine/LICENSE"
    ]
  },
  {
    "name": "Vue",
    "version": "3.5.35",
    "license": "MIT",
    "origin": "embedded in @waline/client 3.15.2 distribution",
    "evidence": "published waline.js.map paths for vue and @vue/* all identify 3.5.35",
    "licenseSources": [
      "scripts/third-party-licenses/vue-3.5.35/LICENSE"
    ]
  },
  {
    "name": "Vue",
    "version": "3.5.43",
    "license": "MIT",
    "origin": "embedded in Twikoo 2.0.8 distribution",
    "evidence": "Vue version marker in both shipped Twikoo bundles and Twikoo 2.0.8 release lock",
    "licenseSources": [
      "node_modules/vue/LICENSE"
    ]
  },
  {
    "name": "warning",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "warning@4.0.3 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/warning--license-from-4.0.3/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/warning/",
    "sourceHash": "d79ff749710dddf5f46f880c6021ca17218810023c13dfea73fe0900e6eab802"
  },
  {
    "name": "web-streams-polyfill",
    "version": "4.3.0",
    "license": "MIT",
    "origin": "embedded in Twikoo 2.0.8 all/CloudBase distribution",
    "evidence": "Twikoo 2.0.8 tag 47cb229 release imports and pnpm lock; CloudBase app/auth/functions/storage maps identify external runtime imports",
    "licenseProvenance": "npm web-streams-polyfill@4.3.0",
    "licenseSources": [
      "scripts/third-party-licenses/web-streams-polyfill--license-from-4.3.0/LICENSE"
    ]
  },
  {
    "name": "xss",
    "version": null,
    "license": "MIT",
    "origin": "embedded in valine published distribution",
    "evidence": "node_modules/valine/dist/Valine.min.js.map sourcesContent; package version not stated; source fingerprint retained, no installed-version inference",
    "licenseProvenance": "xss@1.0.15 published license material; the license source version does not assert the embedded code version",
    "licenseSources": [
      "scripts/third-party-licenses/xss--license-from-1.0.15/LICENSE"
    ],
    "sourceMap": "node_modules/valine/dist/Valine.min.js.map",
    "sourcePrefix": "webpack:///./~/xss/",
    "sourceHash": "1f122a6c0dda4e8001e684c26e706c25b439f98502fe453558a0b93cea063f97"
  }
])

export function inventoryLabel(item) {
  return item.version ? `${item.name}@${item.version}` : `${item.name}@version-not-stated`
}

export function inventoryLicenseTarget(item, source) {
  return `_licenses/${inventoryLabel(item).replaceAll('/', '__')}/${source.split('/').pop().replace(/\.b64$/, '')}`
}

export const incompleteNotices = distributionInventory.filter(item => item.noticeStatus)
