"use strict";

const fs = require('fs');

function genericCacher(cachename, filepathNode, output = "") {
    logger.logInfo("Caching: " + cachename);

    let base = json.parse(json.read("db/cache/" + cachename));
    let inputFiles = filepathNode;
    let inputNames = Object.keys(inputFiles);
    let i = 0;

    for (let file in inputFiles) {
        let filePath = inputFiles[file];
        let fileData = json.parse(json.read(filePath));
        let fileName = "";

        switch (cachename) {
            case "quests.json":
            case "traders.json":
            case "hideout_areas.json":
            case "hideout_production.json":
            case "hideout_scavcase.json":
            case "weather.json":
                base.data.push(fileData);
            break;

            case "items.json":
                fileName = fileData._id;
                base.data[fileName] = fileData;
            break;

            case "customization.json":
                fileName = inputNames[i++];
                base.data[fileName] = fileData;
            break;
        }
    }

    base.crc = utility.adlerGen(json.stringify(base.data));
    json.write("user/cache/" + cachename, base);
}

function items() {
    genericCacher("items.json", db.items);
}

function quests() {
    genericCacher("quests.json", db.quests);
}

function languages() {
    let base = json.parse(json.read("db/cache/languages.json"));

    for (let file of Object.keys(db.locales)) {
        let fileData = json.parse(json.read(db.locales[file][file]));
        base.data.push(fileData);
    }

    base.crc = utility.adlerGen(json.stringify(base.data));
    json.write("user/cache/languages.json", base);
}

function customization() {
    genericCacher("customization.json", db.customization);
}

function hideoutAreas() {
    genericCacher("hideout_areas.json", db.hideout.areas);
}

function hideoutProduction() {
    genericCacher("hideout_production.json", db.hideout.production);
}

function hideoutScavcase() {
    genericCacher("hideout_scavcase.json", db.hideout.scavcase);
}

function weather() {
    genericCacher("weather.json", db.weather);
}

function templates() {
    logger.logInfo("Caching: templates.json");

    let base = json.parse(json.read("db/cache/templates.json"));
    let inputDir = [
        "categories",
        "items"
    ];

    for (let path in inputDir) {
        let inputFiles = db.templates[inputDir[path]];

        for (let file in inputFiles) {
            let filePath = inputFiles[file];
            let fileData = json.parse(json.read(filePath));

            if (path == 0) {
                base.data.Categories.push(fileData);
            } else {
                base.data.Items.push(fileData);
            }
        }
    }

    base.crc = utility.adlerGen(json.stringify(base.data));
    json.write("user/cache/templates.json", base);
}

function assorts(trader) {
    logger.logInfo("Caching: assort_" + trader + ".json");

    let base = json.parse(json.read("db/cache/assort.json"));
    let inputNode = db.assort[trader];
    let inputDir = [
        "items",
        "barter_scheme",
        "loyal_level_items"
    ];

    for (let path in inputDir) {
        let inputFiles = inputNode[inputDir[path]];
        let inputNames = Object.keys(inputFiles);
        let i = 0;

        for (let file in inputFiles) {
            let filePath = inputFiles[file];
            let fileName = inputNames[i++];
            let fileData = json.parse(json.read(filePath));

            if (path == 0) {
                base.data.items.push(fileData);
            } else if (path == 1) {
                base.data.barter_scheme[fileName] = fileData;
            } else if (path == 2) {
                base.data.loyal_level_items[fileName] = fileData;
            }
        }
    }

    base.crc = utility.adlerGen(json.stringify(base.data));
    json.write("user/cache/assort_" + trader + ".json", base);
}

function locales(locale) {
    let base = json.parse(json.read("db/cache/locale.json"));
    let inputNode = db.locales[locale];
    let inputDir = [
        "mail",
        "quest",
        "preset",
        "handbook",
        "season",
        "templates",
        "locations",
        "banners",
        "trading",
    ];

    logger.logInfo("Caching: locale_" + locale + ".json");

    base.data.interface = json.parse(json.read(inputNode.interface));
    base.data.error = json.parse(json.read(inputNode.error));

    for (let path in inputDir) {
        let inputFiles = inputNode[inputDir[path]];
        let inputNames = Object.keys(inputFiles);
        let i = 0;

        for (let file in inputFiles) {
            let filePath = inputFiles[file];
            let fileData = json.parse(json.read(filePath));
            let fileName = inputNames[i++];

            if (path == 0) {
                base.data.mail[fileName] = fileData;
            } else if (path == 1) {
                base.data.quest[fileName] = fileData;
            } else if (path == 2) {
                base.data.preset[fileName] = fileData;
            } else if (path == 3) {
                base.data.handbook[fileName] = fileData;
            } else if (path == 4) {
                base.data.season[fileName] = fileData;
            } else if (path == 5) {
                base.data.templates[fileName] = fileData;
            } else if (path == 6) {
                base.data.locations[fileName] = fileData;
            } else if (path == 7) {
                base.data.banners[fileName] = fileData;
            } else if (path == 8) {
                base.data.trading[fileName] = fileData;
            }
        }
    }

    base.crc = utility.adlerGen(json.stringify(base.data));
    json.write("user/cache/locale_" + locale + ".json", base);
}

function mod() {
    logger.logInfo("Caching: mods.json");    
    json.write("user/cache/mods.json", settings.mods.list);
}

function all() {
    let force = settings.server.rebuildCache;
    let assortList = Object.keys(db.assort);
    let localesList = Object.keys(db.locales);

    // generate cache
    if (force || !fs.existsSync("user/cache/items.json")) {
        items();
    }

    if (force || !fs.existsSync("user/cache/quests.json")) {
        quests();
    }

    if (force || !fs.existsSync("user/cache/locale_languages.json")) {
        languages();
    }

    if (force || !fs.existsSync("user/cache/customization.json")) {
        customization();
    }

    if (force || !fs.existsSync("user/cache/hideout_areas.json")) {
        hideoutAreas();
    }

    if (force || !fs.existsSync("user/cache/hideout_production.json")) {
        hideoutProduction();
    }

    if (force || !fs.existsSync("user/cache/hideout_scavcase.json")) {
        hideoutScavcase();
    }

    if (force || !fs.existsSync("user/cache/weather.json")) {
        weather();
    }

    if (force || !fs.existsSync("user/cache/templates.json")) {
        templates();
    }

    for (let assort in assortList) {
        if (force || !fs.existsSync("user/cache/assort_" + assortList[assort] + ".json")) {
            assorts(assortList[assort]);
        }
    }

    for (let locale in localesList) {
        if (force || !fs.existsSync("user/cache/locale_" + localesList[locale] + ".json")) {
            locales(localesList[locale]);
        }
    }

    if (force || !fs.existsSync("user/cache/mods.json")) {
        mod();
    }

    if (settings.server.rebuildCache) {
        settings.server.rebuildCache = false;
        json.write("user/server.config.json", settings);
    }
}

module.exports.all = all;