/* Microsoft YaHei / 微软雅黑; source canvas coordinates; rear, right, front, left. */
window.GRECHO_SOLUTIONS_REV03_GEOMETRY = {
  "demo-03": {
    "width": 1430,
    "height": 1066,
    "pointOrder": [
      "rear",
      "right",
      "front",
      "left"
    ],
    "top": {
      "sourceQuad": [
        [
          763,
          86
        ],
        [
          1396,
          266
        ],
        [
          653,
          483
        ],
        [
          42,
          251
        ]
      ],
      "targetQuad": [
        [
          763,
          230
        ],
        [
          1375,
          429
        ],
        [
          668,
          654
        ],
        [
          63,
          392
        ]
      ],
      "source": "registered/demo-03-top-registered.png",
      "preservedOriginalSource": "extracted/demo-03-top.png",
      "homographySourceToTarget": [
        [
          0.972327285317914,
          -0.02873803623288794,
          28.135367097605194
        ],
        [
          0.022336434822752035,
          1.0243438582340911,
          126.23517190337105
        ],
        [
          1.697459612060544e-05,
          -8.126533831862472e-05,
          1.0
        ]
      ]
    },
    "bottom": {
      "sourceQuad": [
        [
          765,
          457
        ],
        [
          1387,
          707
        ],
        [
          665,
          955
        ],
        [
          52,
          655
        ]
      ],
      "targetQuad": [
        [
          763,
          386.66666666666663
        ],
        [
          1371,
          583
        ],
        [
          665,
          809
        ],
        [
          65,
          545
        ]
      ],
      "source": "extracted/demo-03-bottom.png",
      "homographySourceToTarget": [
        [
          0.8614532524891992,
          -0.1467711950501667,
          107.59394964537714
        ],
        [
          0.0047775527354500255,
          0.6089660237078997,
          72.55021217894661
        ],
        [
          1.4672668867426983e-05,
          -0.00020658150566801184,
          1.0
        ]
      ]
    },
    "coreUpper": [
      [
        763,
        232
      ],
      [
        1373,
        429
      ],
      [
        668,
        652
      ],
      [
        65,
        392
      ]
    ],
    "coreLower": [
      [
        763,
        381.66666666666663
      ],
      [
        1371,
        578
      ],
      [
        665,
        804
      ],
      [
        65,
        540
      ]
    ],
    "coreSource": "extracted/demo-03-core.png",
    "reference": "assembled/demo-03-assembled.png",
    "intentionalTopOverhangNativePx": 2,
    "intentionalBottomBoundaryVerticalNativePx": 5,
    "coreLowerRearStatus": "ESTIMATED_HIDDEN_POINT",
    "coreLowerRearEstimation": "Core upper rear plus mean of three observed visible vertical cut-face thicknesses.",
    "estimatedCutThicknessNativePx": 149.66666666666666,
    "compositing": {
      "order": [
        "bottom",
        "core",
        "top"
      ],
      "alphaCorrection": true,
      "extraShadow": false,
      "sampling": "Pillow bicubic premultiplied RGBA; browser resampling may differ below one pixel"
    },
    "status": "GEOMETRY_REFERENCE_PENDING_BROWSER_GATE_AND_BOBBY_REVIEW"
  },
  "demo-01": {
    "width": 1427,
    "height": 1062,
    "pointOrder": [
      "rear",
      "right",
      "front",
      "left"
    ],
    "top": {
      "sourceQuad": [
        [
          758,
          85
        ],
        [
          1385,
          271
        ],
        [
          656,
          483
        ],
        [
          43,
          247
        ]
      ],
      "targetQuad": [
        [
          754,
          228
        ],
        [
          1371,
          428
        ],
        [
          664,
          646
        ],
        [
          59,
          395
        ]
      ],
      "source": "registered/demo-01-top-registered.png",
      "preservedOriginalSource": "extracted/demo-01-top.png",
      "homographySourceToTarget": [
        [
          0.9816506299060541,
          0.037420105770668066,
          7.815096424768854
        ],
        [
          0.0057211201581304485,
          1.065196109315158,
          133.45041141292
        ],
        [
          -1.7012894285613593e-07,
          1.8477407068703408e-05,
          1.0
        ]
      ]
    },
    "bottom": {
      "sourceQuad": [
        [
          755,
          455
        ],
        [
          1377,
          706
        ],
        [
          663,
          946
        ],
        [
          49,
          655
        ]
      ],
      "targetQuad": [
        [
          754,
          378.0
        ],
        [
          1366,
          575
        ],
        [
          661,
          800
        ],
        [
          62,
          536
        ]
      ],
      "source": "extracted/demo-01-bottom.png",
      "homographySourceToTarget": [
        [
          0.8250252822459486,
          -0.1879041055696488,
          134.10231109893235
        ],
        [
          0.0042634032824269,
          0.5558733804930949,
          80.49934157332972
        ],
        [
          1.2167070933373965e-05,
          -0.00026066492934330736,
          1.0
        ]
      ]
    },
    "coreUpper": [
      [
        754,
        230
      ],
      [
        1369,
        428
      ],
      [
        664,
        644
      ],
      [
        61,
        395
      ]
    ],
    "coreLower": [
      [
        754,
        373.0
      ],
      [
        1366,
        570
      ],
      [
        661,
        795
      ],
      [
        62,
        531
      ]
    ],
    "coreSource": "extracted/demo-01-core.png",
    "reference": "assembled/demo-01-assembled.png",
    "intentionalTopOverhangNativePx": 2,
    "intentionalBottomBoundaryVerticalNativePx": 5,
    "coreLowerRearStatus": "ESTIMATED_HIDDEN_POINT",
    "coreLowerRearEstimation": "Core upper rear plus mean of three observed visible vertical cut-face thicknesses.",
    "estimatedCutThicknessNativePx": 143.0,
    "compositing": {
      "order": [
        "bottom",
        "core",
        "top"
      ],
      "alphaCorrection": true,
      "extraShadow": false,
      "sampling": "Pillow bicubic premultiplied RGBA; browser resampling may differ below one pixel"
    },
    "status": "GEOMETRY_REFERENCE_PENDING_BROWSER_GATE_AND_BOBBY_REVIEW"
  },
  "demo-02": {
    "width": 1426,
    "height": 1072,
    "pointOrder": [
      "rear",
      "right",
      "front",
      "left"
    ],
    "top": {
      "sourceQuad": [
        [
          749,
          86
        ],
        [
          1387,
          279
        ],
        [
          657,
          484
        ],
        [
          40,
          252
        ]
      ],
      "targetQuad": [
        [
          748,
          227
        ],
        [
          1369,
          430
        ],
        [
          666,
          651
        ],
        [
          58,
          391
        ]
      ],
      "source": "registered/demo-02-top-registered.png",
      "preservedOriginalSource": "extracted/demo-02-top.png",
      "homographySourceToTarget": [
        [
          0.9479289453289403,
          -0.10323851330532728,
          43.605994786235996
        ],
        [
          0.013212828090563195,
          0.9491292499672294,
          134.4849757701942
        ],
        [
          1.3995781831721037e-05,
          -0.00017278482261894184,
          1.0
        ]
      ]
    },
    "bottom": {
      "sourceQuad": [
        [
          747,
          455
        ],
        [
          1381,
          708
        ],
        [
          664,
          948
        ],
        [
          46,
          649
        ]
      ],
      "targetQuad": [
        [
          748,
          382.0
        ],
        [
          1366,
          581
        ],
        [
          660,
          805
        ],
        [
          64,
          543
        ]
      ],
      "source": "extracted/demo-02-bottom.png",
      "homographySourceToTarget": [
        [
          0.8565397577230641,
          -0.1501164847083038,
          113.87363335284665
        ],
        [
          -0.003328408656561374,
          0.6261650945477804,
          67.61466281799258
        ],
        [
          7.846628712614646e-06,
          -0.00019679884539944845,
          1.0
        ]
      ]
    },
    "coreUpper": [
      [
        748,
        229
      ],
      [
        1367,
        430
      ],
      [
        666,
        649
      ],
      [
        60,
        391
      ]
    ],
    "coreLower": [
      [
        748,
        377.0
      ],
      [
        1366,
        576
      ],
      [
        660,
        800
      ],
      [
        64,
        538
      ]
    ],
    "coreSource": "extracted/demo-02-core.png",
    "reference": "assembled/demo-02-assembled.png",
    "intentionalTopOverhangNativePx": 2,
    "intentionalBottomBoundaryVerticalNativePx": 5,
    "coreLowerRearStatus": "ESTIMATED_HIDDEN_POINT",
    "coreLowerRearEstimation": "Core upper rear plus mean of three observed visible vertical cut-face thicknesses.",
    "estimatedCutThicknessNativePx": 148.0,
    "compositing": {
      "order": [
        "bottom",
        "core",
        "top"
      ],
      "alphaCorrection": true,
      "extraShadow": false,
      "sampling": "Pillow bicubic premultiplied RGBA; browser resampling may differ below one pixel"
    },
    "status": "GEOMETRY_REFERENCE_PENDING_BROWSER_GATE_AND_BOBBY_REVIEW"
  },
  "demo-04": {
    "width": 1433,
    "height": 1067,
    "pointOrder": [
      "rear",
      "right",
      "front",
      "left"
    ],
    "top": {
      "sourceQuad": [
        [
          755,
          85
        ],
        [
          1388,
          270
        ],
        [
          656,
          476
        ],
        [
          42,
          246
        ]
      ],
      "targetQuad": [
        [
          755,
          228
        ],
        [
          1369,
          430
        ],
        [
          663,
          630
        ],
        [
          60,
          390
        ]
      ],
      "source": "registered/demo-04-top-registered.png",
      "preservedOriginalSource": "extracted/demo-04-top.png",
      "homographySourceToTarget": [
        [
          1.0059748601100063,
          0.0899964520378618,
          -2.72861426248731
        ],
        [
          0.01323027263061384,
          1.114188105318841,
          126.1535255534845
        ],
        [
          3.949883863537562e-06,
          0.00011189047128122143,
          1.0
        ]
      ]
    },
    "bottom": {
      "sourceQuad": [
        [
          755,
          445
        ],
        [
          1382,
          708
        ],
        [
          662,
          948
        ],
        [
          49,
          652
        ]
      ],
      "targetQuad": [
        [
          755,
          384.66666666666663
        ],
        [
          1365,
          576
        ],
        [
          661,
          799
        ],
        [
          64,
          537
        ]
      ],
      "source": "extracted/demo-04-bottom.png",
      "homographySourceToTarget": [
        [
          0.7928136028558376,
          -0.23491066590094692,
          164.7799005315562
        ],
        [
          0.009521885392940332,
          0.45652506696026934,
          125.32047348090336
        ],
        [
          2.3474764141002192e-05,
          -0.00032610247211156386,
          1.0
        ]
      ]
    },
    "coreUpper": [
      [
        755,
        230
      ],
      [
        1367,
        430
      ],
      [
        663,
        628
      ],
      [
        62,
        390
      ]
    ],
    "coreLower": [
      [
        755,
        379.66666666666663
      ],
      [
        1365,
        571
      ],
      [
        661,
        794
      ],
      [
        64,
        532
      ]
    ],
    "coreSource": "extracted/demo-04-core.png",
    "reference": "assembled/demo-04-assembled.png",
    "intentionalTopOverhangNativePx": 2,
    "intentionalBottomBoundaryVerticalNativePx": 5,
    "coreLowerRearStatus": "ESTIMATED_HIDDEN_POINT",
    "coreLowerRearEstimation": "Core upper rear plus mean of three observed visible vertical cut-face thicknesses.",
    "estimatedCutThicknessNativePx": 149.66666666666666,
    "compositing": {
      "order": [
        "bottom",
        "core",
        "top"
      ],
      "alphaCorrection": true,
      "extraShadow": false,
      "sampling": "Pillow bicubic premultiplied RGBA; browser resampling may differ below one pixel"
    },
    "status": "GEOMETRY_REFERENCE_PENDING_BROWSER_GATE_AND_BOBBY_REVIEW"
  }
};
