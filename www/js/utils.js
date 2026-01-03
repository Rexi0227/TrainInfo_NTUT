function normalizeStationName(name) {
    if (!name) return "";

    return name
        .replace("台北車站", "臺北")
        .replace("台北", "臺北")   // 臺 → 台
        .trim();
}
