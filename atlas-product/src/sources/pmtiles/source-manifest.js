function createPmtilesManifest() {
  return [
    {
      id: "basemap-main",
      kind: "pmtiles",
      role: "basemap",
      url: "/pmtiles/basemap-main.pmtiles",
      layers: ["earth", "water", "landuse", "roads", "boundaries", "buildings", "places"],
      notes: [
        "self-hosted archive path under atlas-product/public/pmtiles/",
        "replace with your own generated archive before expecting live basemap data",
      ],
      mutable: false,
    },
    {
      id: "terrain-dem",
      kind: "pmtiles",
      role: "terrain",
      url: "/pmtiles/terrain-dem.pmtiles",
      layers: ["dem", "hillshade"],
      notes: [
        "optional terrain archive under atlas-product/public/pmtiles/",
      ],
      mutable: false,
    },
  ];
}

export { createPmtilesManifest };
