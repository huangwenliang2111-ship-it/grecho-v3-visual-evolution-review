// Product memberships verified against P01–P14. Review references are in evidence/facet-source-audit.json.
window.productsFacetMap = {
  "categories": [
    {
      "key": "all",
      "label": "All products",
      "product_ids": [
        "P01",
        "P02",
        "P03",
        "P04",
        "P05",
        "P06",
        "P07",
        "P08",
        "P09",
        "P10",
        "P11",
        "P12",
        "P13",
        "P14"
      ]
    },
    {
      "key": "acoustic",
      "label": "Acoustic facings",
      "product_ids": [
        "P01",
        "P05",
        "P06",
        "P07",
        "P08",
        "P09",
        "P10",
        "P11"
      ]
    },
    {
      "key": "insulation",
      "label": "Insulation facers",
      "product_ids": [
        "P02",
        "P03",
        "P04",
        "P14"
      ]
    },
    {
      "key": "building",
      "label": "Building board facers",
      "product_ids": [
        "P12",
        "P13",
        "P14"
      ]
    }
  ],
  "groups": [
    {
      "key": "application",
      "label": "Application",
      "within_group_operator": "OR",
      "helper": "",
      "options": [
        {
          "key": "acoustic",
          "label": "Acoustic ceiling / wall panels",
          "product_ids": [
            "P01",
            "P05",
            "P06",
            "P07",
            "P08",
            "P09",
            "P10",
            "P11"
          ]
        },
        {
          "key": "mineral-wool-insulation",
          "label": "Mineral wool insulation",
          "product_ids": [
            "P02",
            "P03"
          ]
        },
        {
          "key": "glass-wool-insulation",
          "label": "Glass wool insulation",
          "product_ids": [
            "P02"
          ]
        },
        {
          "key": "pir-pur",
          "label": "PIR / PUR insulation",
          "product_ids": [
            "P02",
            "P04",
            "P14"
          ]
        },
        {
          "key": "gypsum",
          "label": "Gypsum boards",
          "product_ids": [
            "P12",
            "P13",
            "P14"
          ]
        },
        {
          "key": "pipe-insulation",
          "label": "Pipe insulation",
          "product_ids": [
            "P02"
          ]
        },
        {
          "key": "industrial-insulation",
          "label": "Industrial insulation",
          "product_ids": [
            "P02"
          ]
        }
      ]
    },
    {
      "key": "surface",
      "label": "Surface Finish",
      "within_group_operator": "OR",
      "helper": "",
      "options": [
        {
          "key": "uniform-coated",
          "label": "Fine / uniform coated surface",
          "product_ids": [
            "P01",
            "P03",
            "P04",
            "P06",
            "P07",
            "P08",
            "P09",
            "P11",
            "P12",
            "P13",
            "P14"
          ]
        },
        {
          "key": "woven",
          "label": "Woven textile texture",
          "product_ids": [
            "P05",
            "P10"
          ]
        },
        {
          "key": "wood-grain",
          "label": "Wood grain",
          "product_ids": [
            "P10",
            "P11"
          ]
        },
        {
          "key": "metallic",
          "label": "Embossed / smooth metallic",
          "product_ids": [
            "P02"
          ]
        },
        {
          "key": "dotted-sanded",
          "label": "Spray-dot / sand-textured options",
          "product_ids": [
            "P01"
          ]
        },
        {
          "key": "matte",
          "label": "Matte / low-glare",
          "product_ids": [
            "P08"
          ]
        }
      ]
    },
    {
      "key": "color",
      "label": "Color",
      "within_group_operator": "OR",
      "helper": "",
      "options": [
        {
          "key": "white",
          "label": "White",
          "product_ids": [
            "P01",
            "P06",
            "P07",
            "P09"
          ]
        },
        {
          "key": "black",
          "label": "Black",
          "product_ids": [
            "P08"
          ]
        },
        {
          "key": "metallic",
          "label": "Aluminium / metallic",
          "product_ids": [
            "P02"
          ]
        },
        {
          "key": "wood-inspired",
          "label": "Wood-inspired colors",
          "product_ids": [
            "P10",
            "P11"
          ]
        },
        {
          "key": "custom-grade",
          "label": "Custom / grade-dependent",
          "product_ids": [
            "P03",
            "P04",
            "P05",
            "P06",
            "P07",
            "P09",
            "P10",
            "P11",
            "P12",
            "P13",
            "P14"
          ]
        }
      ]
    },
    {
      "key": "coating",
      "label": "Coating / Functional Route",
      "within_group_operator": "OR",
      "helper": "",
      "options": [
        {
          "key": "coated-veil",
          "label": "Coated fiberglass veil",
          "product_ids": [
            "P01",
            "P03",
            "P04",
            "P06",
            "P07",
            "P08",
            "P09",
            "P11",
            "P12",
            "P13",
            "P14"
          ]
        },
        {
          "key": "woven-treatment",
          "label": "Woven fabric surface treatment",
          "product_ids": [
            "P05",
            "P10"
          ]
        },
        {
          "key": "foil-composite",
          "label": "Foil / reinforced composite",
          "product_ids": [
            "P02"
          ]
        },
        {
          "key": "washable",
          "label": "Washable coating",
          "product_ids": [
            "P09"
          ]
        },
        {
          "key": "water-resistant",
          "label": "Water-resistant coating options",
          "product_ids": [
            "P03",
            "P13"
          ]
        },
        {
          "key": "uv-resistant",
          "label": "UV-resistant coating",
          "product_ids": [
            "P14"
          ]
        }
      ]
    },
    {
      "key": "gsm",
      "label": "GSM / Area Weight",
      "within_group_operator": "OR",
      "helper": "Ranges vary by grade; confirm the required specification.",
      "options": [
        {
          "key": "published-range",
          "label": "Published range: 80–260 g/m²",
          "product_ids": [
            "P01"
          ]
        },
        {
          "key": "range-not-published",
          "label": "Range not published — confirm by grade",
          "product_ids": [
            "P02",
            "P03",
            "P04",
            "P05",
            "P06",
            "P07",
            "P08",
            "P09",
            "P10",
            "P11",
            "P12",
            "P13",
            "P14"
          ]
        }
      ]
    },
    {
      "key": "width",
      "label": "Width",
      "within_group_operator": "OR",
      "helper": "Ranges vary by grade; confirm the required specification.",
      "options": [
        {
          "key": "published-range",
          "label": "Published range: 1.2–2.5 m",
          "product_ids": [
            "P01"
          ]
        },
        {
          "key": "range-not-published",
          "label": "Range not published — confirm by grade",
          "product_ids": [
            "P02",
            "P03",
            "P04",
            "P05",
            "P06",
            "P07",
            "P08",
            "P09",
            "P10",
            "P11",
            "P12",
            "P13",
            "P14"
          ]
        }
      ]
    },
    {
      "key": "flags",
      "label": "Performance Route",
      "within_group_operator": "AND",
      "helper": "Match all selected",
      "options": [
        {
          "key": "airflow",
          "label": "Air permeability review",
          "product_ids": [
            "P01",
            "P03",
            "P05",
            "P06",
            "P07",
            "P08",
            "P09",
            "P10",
            "P11",
            "P12"
          ]
        },
        {
          "key": "water",
          "label": "Water-resistant grade options",
          "product_ids": [
            "P03",
            "P13",
            "P14"
          ]
        },
        {
          "key": "vapor",
          "label": "Vapor transmission review",
          "product_ids": [
            "P02",
            "P03"
          ]
        },
        {
          "key": "reflective",
          "label": "Reflective metallic surface",
          "product_ids": [
            "P02"
          ]
        },
        {
          "key": "reinforcement",
          "label": "Reinforcement options",
          "product_ids": [
            "P02",
            "P04"
          ]
        },
        {
          "key": "cleaning",
          "label": "Wiping / washing",
          "product_ids": [
            "P09"
          ]
        },
        {
          "key": "uv",
          "label": "UV exposure review",
          "product_ids": [
            "P14"
          ]
        }
      ]
    }
  ]
};
