const error = [
  {
    type: 'generating',
    message: 'GoogleRequester: No requests to run',
    data: {
      title: 'OptionsTradingCourseAssignmentGuide',
      pages: [
        {
          title: 'Company',
          tabColor: { red: 23, green: 99, blue: 184 },
          rows: 100,
          groups: [
            {
              title: 'Identity',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 7, green: 55, blue: 99 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Symbol',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: { kind: 'text' }
                },
                {
                  title: 'DateAdded',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'number',
                    format: [
                      { type: 'year', length: 'long' },
                      '-',
                      { type: 'month', length: 'long' },
                      '-',
                      { type: 'day', length: 'long' }
                    ]
                  }
                }
              ]
            },
            {
              title: 'Fundamentals',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 7, green: 55, blue: 99 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Exchange',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'text',
                    rule: { type: 'enum', values: [ 'NYSE', 'NASDAQ' ] },
                    styles: [
                      {
                        rule: { type: 'is', value: 'NYSE' },
                        apply: { fore: { red: 76, green: 153, blue: 0 } }
                      },
                      {
                        rule: { type: 'is', value: 'NASDAQ' },
                        apply: { fore: { red: 153, green: 51, blue: 102 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Sector',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [
                        'Technology',
                        'Healthcare',
                        'Financial',
                        'ConsumerGoods',
                        'IndustrialGoods',
                        'BasicMaterials',
                        'Utilities',
                        'Services',
                        'Conglomerates',
                        'Energy'
                      ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Technology' },
                        apply: { fore: { red: 66, green: 133, blue: 244 } }
                      },
                      {
                        rule: { type: 'is', value: 'Healthcare' },
                        apply: { fore: { red: 219, green: 68, blue: 55 } }
                      },
                      {
                        rule: { type: 'is', value: 'Financial' },
                        apply: { fore: { red: 244, green: 180, blue: 0 } }
                      },
                      {
                        rule: { type: 'is', value: 'ConsumerGoods' },
                        apply: { fore: { red: 15, green: 157, blue: 88 } }
                      },
                      {
                        rule: { type: 'is', value: 'IndustrialGoods' },
                        apply: { fore: { red: 171, green: 71, blue: 188 } }
                      },
                      {
                        rule: { type: 'is', value: 'BasicMaterials' },
                        apply: { fore: { red: 0, green: 172, blue: 193 } }
                      },
                      {
                        rule: { type: 'is', value: 'Utilities' },
                        apply: { fore: { red: 255, green: 112, blue: 67 } }
                      },
                      {
                        rule: { type: 'is', value: 'Services' },
                        apply: { fore: { red: 142, green: 36, blue: 170 } }
                      },
                      {
                        rule: { type: 'is', value: 'Conglomerates' },
                        apply: { fore: { red: 92, green: 107, blue: 192 } }
                      },
                      {
                        rule: { type: 'is', value: 'Energy' },
                        apply: { fore: { red: 244, green: 81, blue: 30 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Industry',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: { kind: 'text' }
                },
                {
                  title: 'MarketCap',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'PERatio',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 2 }
                  }
                },
                {
                  title: 'Beta',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 2 }
                  }
                },
                {
                  title: 'DividendYield',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'percent', commas: true, decimal: 1 }
                  }
                },
                {
                  title: 'WeekHigh52',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'WeekLow52',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'AvgVolume',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 11, green: 83, blue: 148 },
                    bold: true
                  },
                  dataStyle: { back: { red: 206, green: 226, blue: 240 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: null }
                  }
                }
              ]
            }
          ]
        },
        {
          title: 'Daily',
          tabColor: { red: 27, green: 101, blue: 122 },
          rows: 100,
          groups: [
            {
              title: 'Identity',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 12, green: 52, blue: 61 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Id',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: { kind: 'text' }
                },
                {
                  title: 'Symbol',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'lookup',
                      values: {
                        page: 'Company',
                        from: { col: '$0', row: '$2' },
                        to: { col: '$0' }
                      }
                    }
                  }
                },
                {
                  title: 'Date',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: [
                      { type: 'year', length: 'long' },
                      '-',
                      { type: 'month', length: 'long' },
                      '-',
                      { type: 'day', length: 'long' }
                    ]
                  }
                }
              ]
            },
            {
              title: 'MarketData',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 12, green: 52, blue: 61 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Open',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'High',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Low',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Close',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Volume',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: null }
                  }
                }
              ]
            },
            {
              title: 'TechnicalIndicators',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 12, green: 52, blue: 61 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'MA50',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'MA20',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Bollinger20Upper',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Bollinger20Lower',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'RSI14',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 0 }
                  }
                }
              ]
            },
            {
              title: 'Analysis',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 12, green: 52, blue: 61 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Trend',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [
                        'Uptrend',
                        'Downtrend',
                        'Sideways',
                        'Volatile',
                        'Stable'
                      ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Uptrend' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'Downtrend' },
                        apply: { fore: { red: 244, green: 67, blue: 54 } }
                      },
                      {
                        rule: { type: 'is', value: 'Sideways' },
                        apply: { fore: { red: 255, green: 193, blue: 7 } }
                      },
                      {
                        rule: { type: 'is', value: 'Volatile' },
                        apply: { fore: { red: 156, green: 39, blue: 176 } }
                      },
                      {
                        rule: { type: 'is', value: 'Stable' },
                        apply: { fore: { red: 96, green: 125, blue: 139 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Volatility',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [ 'High', 'Medium', 'Low' ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'High' },
                        apply: { fore: { red: 233, green: 30, blue: 99 } }
                      },
                      {
                        rule: { type: 'is', value: 'Medium' },
                        apply: { fore: { red: 3, green: 169, blue: 244 } }
                      },
                      {
                        rule: { type: 'is', value: 'Low' },
                        apply: { fore: { red: 139, green: 195, blue: 74 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Momentum',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [ 'Increasing', 'Decreasing', 'Neutral' ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Increasing' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'Decreasing' },
                        apply: { fore: { red: 244, green: 67, blue: 54 } }
                      },
                      {
                        rule: { type: 'is', value: 'Neutral' },
                        apply: { fore: { red: 158, green: 158, blue: 158 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Support',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Resistance',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                }
              ]
            },
            {
              title: 'Predictions',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 12, green: 52, blue: 61 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Prediction',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [
                        'Increase',
                        'Decrease',
                        'NoChange',
                        'Breakout',
                        'Breakdown'
                      ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Increase' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'Decrease' },
                        apply: { fore: { red: 244, green: 67, blue: 54 } }
                      },
                      {
                        rule: { type: 'is', value: 'NoChange' },
                        apply: { fore: { red: 255, green: 193, blue: 7 } }
                      },
                      {
                        rule: { type: 'is', value: 'Breakout' },
                        apply: { fore: { red: 103, green: 58, blue: 183 } }
                      },
                      {
                        rule: { type: 'is', value: 'Breakdown' },
                        apply: { fore: { red: 255, green: 87, blue: 34 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Confidence',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [ 'High', 'Medium', 'Low' ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'High' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'Medium' },
                        apply: { fore: { red: 255, green: 193, blue: 7 } }
                      },
                      {
                        rule: { type: 'is', value: 'Low' },
                        apply: { fore: { red: 244, green: 67, blue: 54 } }
                      }
                    ]
                  }
                },
                {
                  title: 'AIAssessment',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [
                        'Aligned',
                        'PartiallyAligned',
                        'Contradicted',
                        'AdditionalInsights'
                      ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Aligned' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'PartiallyAligned' },
                        apply: { fore: { red: 255, green: 193, blue: 7 } }
                      },
                      {
                        rule: { type: 'is', value: 'Contradicted' },
                        apply: { fore: { red: 244, green: 67, blue: 54 } }
                      },
                      {
                        rule: { type: 'is', value: 'AdditionalInsights' },
                        apply: { fore: { red: 3, green: 169, blue: 244 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Validation',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 19, green: 79, blue: 92 },
                    bold: true
                  },
                  dataStyle: { back: { red: 203, green: 229, blue: 232 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [ 'Accurate', 'Partial', 'Inaccurate' ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Accurate' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'Partial' },
                        apply: { fore: { red: 255, green: 193, blue: 7 } }
                      },
                      {
                        rule: { type: 'is', value: 'Inaccurate' },
                        apply: { fore: { red: 244, green: 67, blue: 54 } }
                      }
                    ]
                  }
                }
              ]
            },
            {
              title: 'Feedback',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 12, green: 52, blue: 61 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: []
            }
          ]
        },
        {
          title: 'Intraday',
          tabColor: { red: 0, green: 143, blue: 143 },
          rows: 100,
          groups: [
            {
              title: 'Identity',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 0, green: 69, blue: 72 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Id',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: { kind: 'text' }
                },
                {
                  title: 'Symbol',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'lookup',
                      values: {
                        page: 'Daily',
                        from: { col: '$1', row: '$2' },
                        to: { col: '$1' }
                      }
                    }
                  }
                },
                {
                  title: 'Date',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'number',
                    format: [
                      { type: 'year', length: 'long' },
                      '-',
                      { type: 'month', length: 'long' },
                      '-',
                      { type: 'day', length: 'long' }
                    ]
                  }
                },
                {
                  title: 'Time',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [ 'Morning', 'Midday', 'Afternoon' ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Morning' },
                        apply: { fore: { red: 255, green: 204, blue: 128 } }
                      },
                      {
                        rule: { type: 'is', value: 'Midday' },
                        apply: { fore: { red: 255, green: 171, blue: 145 } }
                      },
                      {
                        rule: { type: 'is', value: 'Afternoon' },
                        apply: { fore: { red: 255, green: 112, blue: 67 } }
                      }
                    ]
                  }
                },
                {
                  title: 'DailyLink',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'lookup',
                      values: {
                        page: 'Daily',
                        from: { col: '$0', row: '$2' },
                        to: { col: '$0' }
                      }
                    }
                  }
                }
              ]
            },
            {
              title: 'MarketData',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 0, green: 69, blue: 72 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'CurrentPrice',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'IntradayHigh',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'IntradayLow',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Volume',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: null }
                  }
                }
              ]
            },
            {
              title: 'TechnicalIndicators',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 0, green: 69, blue: 72 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'MA5',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'RSI5',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 0 }
                  }
                }
              ]
            },
            {
              title: 'Analysis',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 0, green: 69, blue: 72 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Trend',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [
                        'Uptrend',
                        'Downtrend',
                        'Sideways',
                        'Volatile',
                        'Stable'
                      ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Uptrend' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'Downtrend' },
                        apply: { fore: { red: 244, green: 67, blue: 54 } }
                      },
                      {
                        rule: { type: 'is', value: 'Sideways' },
                        apply: { fore: { red: 255, green: 193, blue: 7 } }
                      },
                      {
                        rule: { type: 'is', value: 'Volatile' },
                        apply: { fore: { red: 156, green: 39, blue: 176 } }
                      },
                      {
                        rule: { type: 'is', value: 'Stable' },
                        apply: { fore: { red: 96, green: 125, blue: 139 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Volatility',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [ 'High', 'Medium', 'Low' ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'High' },
                        apply: { fore: { red: 233, green: 30, blue: 99 } }
                      },
                      {
                        rule: { type: 'is', value: 'Medium' },
                        apply: { fore: { red: 3, green: 169, blue: 244 } }
                      },
                      {
                        rule: { type: 'is', value: 'Low' },
                        apply: { fore: { red: 139, green: 195, blue: 74 } }
                      }
                    ]
                  }
                },
                {
                  title: 'AIFeedback',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 0, green: 110, blue: 110 },
                    bold: true
                  },
                  dataStyle: { back: { red: 209, green: 240, blue: 236 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'enum',
                      values: [
                        'ConfirmedAnalysis',
                        'SuggestedChange',
                        'NewOpportunity'
                      ]
                    },
                    styles: [
                      {
                        rule: { type: 'is', value: 'ConfirmedAnalysis' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'SuggestedChange' },
                        apply: { fore: { red: 255, green: 193, blue: 7 } }
                      },
                      {
                        rule: { type: 'is', value: 'NewOpportunity' },
                        apply: { fore: { red: 3, green: 169, blue: 244 } }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        },
        {
          title: 'Trade',
          tabColor: { red: 230, green: 117, blue: 26 },
          rows: 100,
          groups: [
            {
              title: 'Identity',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 120, green: 63, blue: 4 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Id',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: { kind: 'text' }
                },
                {
                  title: 'Symbol',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'lookup',
                      values: {
                        page: 'Daily',
                        from: { col: '$1', row: '$2' },
                        to: { col: '$1' }
                      }
                    }
                  }
                },
                {
                  title: 'IntradayLink',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'text',
                    rule: {
                      type: 'lookup',
                      values: {
                        page: 'Intraday',
                        from: { col: '$0', row: '$2' },
                        to: { col: '$0' }
                      }
                    }
                  }
                },
                {
                  title: 'AILink',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: { kind: 'text' }
                }
              ]
            },
            {
              title: 'EntryDetails',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 120, green: 63, blue: 4 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: []
            },
            {
              title: 'Leg1',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 120, green: 63, blue: 4 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Action',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'text',
                    rule: { type: 'enum', values: [ 'Buy', 'Sell' ] },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Buy' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'Sell' },
                        apply: { fore: { red: 244, green: 67, blue: 54 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Type',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'text',
                    rule: { type: 'enum', values: [ 'Call', 'Put' ] },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Call' },
                        apply: { fore: { red: 3, green: 169, blue: 244 } }
                      },
                      {
                        rule: { type: 'is', value: 'Put' },
                        apply: { fore: { red: 255, green: 87, blue: 34 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Strike',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Expiration',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: [
                      { type: 'year', length: 'long' },
                      '-',
                      { type: 'month', length: 'long' },
                      '-',
                      { type: 'day', length: 'long' }
                    ]
                  }
                },
                {
                  title: 'Premium',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Delta',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 2 }
                  }
                },
                {
                  title: 'Theta',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 2 }
                  }
                },
                {
                  title: 'Vega',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 2 }
                  }
                }
              ]
            },
            {
              title: 'Leg2',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 120, green: 63, blue: 4 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Action',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'text',
                    rule: { type: 'enum', values: [ 'Buy', 'Sell' ] },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Buy' },
                        apply: { fore: { red: 76, green: 175, blue: 80 } }
                      },
                      {
                        rule: { type: 'is', value: 'Sell' },
                        apply: { fore: { red: 244, green: 67, blue: 54 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Type',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'text',
                    rule: { type: 'enum', values: [ 'Call', 'Put' ] },
                    styles: [
                      {
                        rule: { type: 'is', value: 'Call' },
                        apply: { fore: { red: 3, green: 169, blue: 244 } }
                      },
                      {
                        rule: { type: 'is', value: 'Put' },
                        apply: { fore: { red: 255, green: 87, blue: 34 } }
                      }
                    ]
                  }
                },
                {
                  title: 'Strike',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Expiration',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: [
                      { type: 'year', length: 'long' },
                      '-',
                      { type: 'month', length: 'long' },
                      '-',
                      { type: 'day', length: 'long' }
                    ]
                  }
                },
                {
                  title: 'Premium',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'Delta',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 2 }
                  }
                },
                {
                  title: 'Theta',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 2 }
                  }
                },
                {
                  title: 'Vega',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: 2 }
                  }
                }
              ]
            },
            {
              title: 'Strategy',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 120, green: 63, blue: 4 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'Strategy',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: { kind: 'text' }
                }
              ]
            },
            {
              title: 'Performance',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 120, green: 63, blue: 4 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'ExitDate',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: [
                      { type: 'year', length: 'long' },
                      '-',
                      { type: 'month', length: 'long' },
                      '-',
                      { type: 'day', length: 'long' }
                    ]
                  }
                },
                {
                  title: 'ProfitLoss',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'ROI',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 180, green: 95, blue: 6 },
                    bold: true
                  },
                  dataStyle: { back: { red: 253, green: 217, blue: 188 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'percent', commas: true, decimal: 0 }
                  }
                }
              ]
            }
          ]
        },
        {
          title: 'Summary',
          tabColor: { red: 75, green: 144, blue: 34 },
          rows: 20,
          groups: [
            {
              title: 'Metrics',
              titleStyle: {
                fore: { red: 255, green: 255, blue: 255 },
                back: { red: 41, green: 78, blue: 19 },
                bold: true,
                between: {
                  type: 'thin',
                  color: { red: 85, green: 85, blue: 85 }
                }
              },
              columns: [
                {
                  title: 'TotalTrades',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 56, green: 118, blue: 29 },
                    bold: true
                  },
                  dataStyle: { back: { red: 214, green: 232, blue: 206 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: null }
                  }
                },
                {
                  title: 'WinningTrades',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 56, green: 118, blue: 29 },
                    bold: true
                  },
                  dataStyle: { back: { red: 214, green: 232, blue: 206 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: null }
                  }
                },
                {
                  title: 'LosingTrades',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 56, green: 118, blue: 29 },
                    bold: true
                  },
                  dataStyle: { back: { red: 214, green: 232, blue: 206 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'number', commas: true, decimal: null }
                  }
                },
                {
                  title: 'WinRate',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 56, green: 118, blue: 29 },
                    bold: true
                  },
                  dataStyle: { back: { red: 214, green: 232, blue: 206 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'percent', commas: true, decimal: 0 }
                  }
                },
                {
                  title: 'AverageProfitLoss',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 56, green: 118, blue: 29 },
                    bold: true
                  },
                  dataStyle: { back: { red: 214, green: 232, blue: 206 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'TotalProfitLoss',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 56, green: 118, blue: 29 },
                    bold: true
                  },
                  dataStyle: { back: { red: 214, green: 232, blue: 206 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'PortfolioValue',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 56, green: 118, blue: 29 },
                    bold: true
                  },
                  dataStyle: { back: { red: 214, green: 232, blue: 206 } },
                  behavior: {
                    kind: 'number',
                    format: {
                      type: 'currency',
                      commas: true,
                      decimal: 2,
                      symbol: '$'
                    }
                  }
                },
                {
                  title: 'ROI',
                  titleStyle: {
                    fore: { red: 255, green: 255, blue: 255 },
                    back: { red: 56, green: 118, blue: 29 },
                    bold: true
                  },
                  dataStyle: { back: { red: 214, green: 232, blue: 206 } },
                  behavior: {
                    kind: 'number',
                    format: { type: 'percent', commas: true, decimal: 0 }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  }
];