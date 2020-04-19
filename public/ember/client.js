'use strict';



;define("client/adapters/application", ["exports", "ember-data"], function (_exports, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _emberData.default.RESTAdapter.extend({});

  _exports.default = _default;
});
;define("client/app", ["exports", "client/resolver", "ember-load-initializers", "client/config/environment"], function (_exports, _resolver, _emberLoadInitializers, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const App = Ember.Application.extend({
    rootElement: '#ember-app',
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });
  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);
  var _default = App;
  _exports.default = _default;
});
;define("client/client-data/operator-options", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var options = [{
    label: "add",
    value: "+"
  }, {
    label: "sub",
    value: "-"
  }, {
    label: "mul",
    value: "x"
  }, {
    label: "div",
    value: "/"
  }, {
    label: "lt",
    value: "<"
  }, {
    label: "gt",
    value: ">"
  }, {
    label: "le",
    value: "<="
  }, {
    label: "ge",
    value: ">="
  }, {
    label: "ne",
    value: "!="
  }, {
    label: "ca",
    value: "CA"
  }, {
    label: "cb",
    value: "CB"
  }, {
    label: "gand",
    value: "&"
  }, {
    label: "gor",
    value: "|"
  }];
  var _default = options;
  _exports.default = _default;
});
;define("client/components/entry-record", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    classNames: ['entry-record-container'],
    init: function () {
      this.set('status', this.get('entry.status') == 'on');
      this.set('statusClass', this.get('status') ? 'entry-record-status-green' : '');
      this.set('statusTitle', this.get('status') ? 'Strategy: On' : 'Strategy: Off');

      this._super(...arguments);
    },
    properties: Ember.computed('entry.strategy', 'entry.trade', 'entry.stock', function () {
      let entry = this.get('entry');
      let properties = []; //strategy model

      let strategy = entry.get('strategy');
      let trade = entry.get('trade');
      let stock = entry.get('stock');
      let counter = entry.get('counter') || {};
      properties.push({
        key: 'strategy',
        label: "Strategy",
        value: strategy
      });
      properties.push({
        key: 'trade',
        label: "Trade",
        value: trade
      });
      properties.push({
        key: 'stock',
        label: "Stock",
        value: stock
      });
      properties.push({
        key: 'counter',
        label: "Counter",
        value: counter
      });
      return properties;
    }),
    actions: {
      toggleStatus: function () {
        let status = this.get('status');
        status = !status;
        this.set('status', status);
        this.set('statusClass', status ? 'entry-record-status-green' : '');
        this.set('statusTitle', status ? 'Strategy: On' : 'Strategy: Off');
        let entry = this.get('entry');
        this.set('entry.status', status ? 'on' : 'off');
        entry.save();
      },
      editEntry: function (model) {
        this.edit(model);
      },
      deleteEntry: function (model) {
        this.delete(model);
      }
    }
  });

  _exports.default = _default;
});
;define("client/components/entry-row", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({});

  _exports.default = _default;
});
;define("client/components/entry-wrapper", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    init: function () {
      this._super(...arguments);

      this.set("strategies", this.get('model.strategies'));
      this.set('trades', this.get("model.trades"));
      this.set('stocks', this.get('model.stocks'));
      this.set("counters", this.get('model.strategies'));
    },
    actions: {
      edit: function (model) {
        this.set('editModel', model);
      },
      delete: function (model) {
        var b = confirm("Do you want to delete?");

        if (b) {
          model.deleteRecord();
          model.save();
        }
      },
      editClose: function () {
        var b = confirm("Do you want to save?");

        if (b) {
          this.get('editModel').save();
        } else {
          this.get('editModel').deleteRecord();
        }

        this.set('editModel', false);
      },
      formInput: async function (key) {
        let input = document.getElementById(key + "-input");
        var r = null;

        if (input.value.length < 3) {
          this.set('stocks', Ember.A());
          return;
        }

        var query = {
          name: input.value,
          type: "EQ",
          exchange: "NSE"
        };
        this.model.stocks.store.query(key, query).then(v => {
          this.set('stocks', v);
        }); // this.set(key+'s', result)
      },
      selectHash: function (key, value) {
        let model = this.get('editModel');
        model.set(key, value);
      },
      newEntry: function () {
        let entry = this.model.entries.store.createRecord('entry', {
          name: "new entry",
          strategy: this.get('strategies').objectAt(0),
          trade: this.get('trades').objectAt(0),
          stock: this.get('stocks').objectAt(0),
          counter: null,
          status: 'off'
        });
        this.set('editModel', entry);
      },
      getHashFromOptions: function (singular, plural) {
        let model = this.get('editModel');
        let select = document.getElementById(singular + '-list');
        let value = null;
        if (value != -1) value = this.get(plural).objectAt(select.value);
        model.set(singular, value);
      }
    }
  });

  _exports.default = _default;
});
;define("client/components/operand", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    classNames: ['display--inline-block'],
    actions: {
      add: function (event) {
        this.add(event);
      },
      close: function (event) {
        this.close(event);
      }
    }
  });

  _exports.default = _default;
});
;define("client/components/operation", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    classNames: ['display--inline-block', 'operation-block'],
    left: Ember.computed('data.left', 'data', function () {
      return this.get('data.left');
    }),
    right: Ember.computed('data.right', 'data', function () {
      return this.get('data.right');
    }),
    leftComponent: Ember.computed('left', function () {
      let operator = this.get('left.operator');

      if (operator) {
        return 'operation';
      }

      return 'operand';
    }),
    rightComponent: Ember.computed('right', function () {
      let operator = this.get('right.operator');

      if (operator) {
        return 'operation';
      }

      return 'operand';
    }),
    actions: {
      close: function (args, event) {
        if (args == 'left') {
          let right = this.get('data.right');
          this.changed(right);
        } else if (args == 'right') {
          let left = this.get('data.left');
          this.changed(left);
        }
      },
      add: function (args, event) {
        let data = this.get('data');

        if (args == 'left') {
          let left = data.left;
          Ember.set(data, 'left', {
            left,
            operator: 'add',
            right: {}
          });
        } else if (args == 'right') {
          let right = data.right;
          Ember.set(data, 'right', {
            left: right,
            operator: 'add',
            right: {}
          });
        }
      },
      changed: function (args, data) {
        Ember.set(this.get('data'), args, data);
      }
    }
  });

  _exports.default = _default;
});
;define("client/components/operator", ["exports", "client/client-data/operator-options"], function (_exports, _operatorOptions) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    init: function () {
      this._super(...arguments);
    },
    classNames: ['display--inline-block'],
    select_options: _operatorOptions.default,
    actions: {
      changed: function (event) {
        this.set('model', event.target.value);
      }
    }
  });

  _exports.default = _default;
});
;define("client/components/property-component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    classNames: ['property-row']
  });

  _exports.default = _default;
});
;define("client/components/strategy-component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    actions: {
      changed: function () {},
      toggleType: function () {
        this.set('strategy.type', this.get('strategy.type') == 'buy' ? 'sell' : 'buy');
      }
    }
  });

  _exports.default = _default;
});
;define("client/components/strategy-wrapper", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    nothing: null,
    didInsertElement: function () {
      let ul = document.getElementById('strategy-list');
      Array.from(ul.children)[0].click();
    },
    actions: {
      showStrategy: function (strategy) {
        this.set('currentStrategy', strategy);
      },
      newStrategy: function () {
        let newLogic = {
          left: {},
          operator: 'add',
          right: {}
        };
        newLogic = JSON.stringify(newLogic);
        let strategy = {
          name: "new",
          type: 'buy',
          operation: JSON.parse(newLogic),
          beginOn: JSON.parse(newLogic),
          endOn: JSON.parse(newLogic)
        };
        let model = this.get('model');
        strategy = model.store.createRecord('strategy', strategy);
        this.set('currentStrategy', strategy);
      },
      saveStrategy: function () {
        let strategy = this.get('currentStrategy');
        strategy.save();
      },
      deleteStrategy: function (strategy, event) {
        if (strategy == this.get('currentStrategy')) {
          this.set('currentStrategy', this.get('model').objectAt(0));
        }

        if (strategy.get('isNew')) {
          strategy.unloadRecord();
        } else {
          confirm("Do you want to delete?") && strategy.destroyRecord();
        }

        event.stopPropagation();
      },
      resetStrategy: function (event) {
        let strategy = this.get("currentStrategy");
        event.stopPropagation();
        strategy.rollbackAttributes();
        strategy.reload();
      }
    }
  });

  _exports.default = _default;
});
;define("client/components/tab-component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({});

  _exports.default = _default;
});
;define("client/components/trade-component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    init: function () {
      this._super(...arguments);

      let template = '{"operand":{"func":"","args":""},"operation":{"left":{},"operator":"add","right":{}},"value":0}';
      let input = {
        price: JSON.parse(template),
        target: JSON.parse(template),
        stoploss: JSON.parse(template)
      };
      let constants = {
        OPERAND: 'operand',
        OPERATION: 'operation',
        VALUE: null
      };
      this.setProperties({
        input,
        constants
      });
    },
    priceComp: Ember.computed('trade.price', function () {
      let price = this.get('trade.price');

      if (typeof price == 'object') {
        if (price.hasOwnProperty('func')) {
          return 'operand';
        } else {
          return 'operation';
        }
      }

      return null;
    }),
    targetComp: Ember.computed('trade.target', function () {
      let target = this.get('trade.target');

      if (typeof target == 'object') {
        if (target.hasOwnProperty('func')) {
          return 'operand';
        } else {
          return 'operation';
        }
      }

      return null;
    }),
    stoplossComp: Ember.computed('trade.stoploss', function () {
      let sl = this.get('trade.stoploss');

      if (typeof sl == 'object') {
        if (sl.hasOwnProperty('func')) {
          return 'operand';
        } else {
          return 'operation';
        }
      }

      return null;
    }),
    actions: {
      changed: function () {},
      add: function (event, type) {
        let comp = this.get("".concat(type, "Comp"));

        if (comp == 'operand') {
          let data = this.get('trade')[type];
          data = {
            left: data,
            operator: '',
            right: {}
          };
          Ember.set("trade.".concat(type), data);
        }
      },
      close: function (event) {
        console.log(event);
      },
      toggleLogic: function (type) {
        let component = this.get("".concat(type, "Comp"));

        if (component == this.constants.VALUE) {
          this.input[type].value = this.get('trade')[type];
          Ember.set(this.get("trade"), type, this.input[type].operand);
        } else if (component == this.constants.OPERAND) {
          this.input[type].operand = this.get('trade')[type];
          Ember.set(this.get("trade"), type, this.input[type].operation);
        } else if (component == this.constants.OPERATION) {
          this.input[type].operation = this.get('trade')[type];
          Ember.set(this.get("trade"), type, this.input[type].value);
        }
      }
    }
  });

  _exports.default = _default;
});
;define("client/components/trade-wrapper", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    nothing: null,
    didInsertElement: function () {
      let ul = document.getElementById('trade-list');
      ul = Array.from(ul.children);
      if (ul.length > 0) ul[0].click();
    },
    actions: {
      showTrade: function (trade) {
        this.set('currentTrade', trade);
      },
      newTrade: function () {
        let newLogic = {
          left: {},
          operator: 'add',
          right: {}
        };
        newLogic = JSON.stringify(newLogic);
        let trade = {
          name: "new",
          operation: JSON.parse(newLogic),
          beginOn: JSON.parse(newLogic),
          endOn: JSON.parse(newLogic)
        };
        let model = this.get('model');
        trade = model.store.createRecord('trade', trade);
        this.set('currentTrade', trade);
      },
      saveTrade: function () {
        let trade = this.get('currentTrade');
        trade.save();
      },
      deleteTrade: function (trade, event) {
        if (trade == this.get('currentTrade')) {
          this.set('currentTrade', this.get('model').objectAt(0));
        }

        if (trade.get('isNew')) {
          trade.unloadRecord();
        } else {
          confirm("Do you want to delete?") && trade.destroyRecord();
        }

        event.stopPropagation();
      },
      resetTrade: function (event) {
        let trade = this.get("currentTrade");
        event.stopPropagation();
        trade.rollbackAttributes();
        trade.reload();
      }
    }
  });

  _exports.default = _default;
});
;define("client/components/welcome-page", ["exports", "ember-welcome-page/components/welcome-page"], function (_exports, _welcomePage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
;define("client/helpers/and", ["exports", "ember-truth-helpers/helpers/and"], function (_exports, _and) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _and.default;
    }
  });
  Object.defineProperty(_exports, "and", {
    enumerable: true,
    get: function () {
      return _and.and;
    }
  });
});
;define("client/helpers/app-version", ["exports", "client/config/environment", "ember-cli-app-version/utils/regexp"], function (_exports, _environment, _regexp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.appVersion = appVersion;
  _exports.default = void 0;

  function appVersion(_, hash = {}) {
    const version = _environment.default.APP.version; // e.g. 1.0.0-alpha.1+4jds75hf
    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility

    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;
    let match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      } // Fallback to just version


      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  var _default = Ember.Helper.helper(appVersion);

  _exports.default = _default;
});
;define("client/helpers/eq", ["exports", "ember-truth-helpers/helpers/equal"], function (_exports, _equal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _equal.default;
    }
  });
  Object.defineProperty(_exports, "equal", {
    enumerable: true,
    get: function () {
      return _equal.equal;
    }
  });
});
;define("client/helpers/gt", ["exports", "ember-truth-helpers/helpers/gt"], function (_exports, _gt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gt.default;
    }
  });
  Object.defineProperty(_exports, "gt", {
    enumerable: true,
    get: function () {
      return _gt.gt;
    }
  });
});
;define("client/helpers/gte", ["exports", "ember-truth-helpers/helpers/gte"], function (_exports, _gte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gte.default;
    }
  });
  Object.defineProperty(_exports, "gte", {
    enumerable: true,
    get: function () {
      return _gte.gte;
    }
  });
});
;define("client/helpers/is-array", ["exports", "ember-truth-helpers/helpers/is-array"], function (_exports, _isArray) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isArray.default;
    }
  });
  Object.defineProperty(_exports, "isArray", {
    enumerable: true,
    get: function () {
      return _isArray.isArray;
    }
  });
});
;define("client/helpers/is-empty", ["exports", "ember-truth-helpers/helpers/is-empty"], function (_exports, _isEmpty) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEmpty.default;
    }
  });
});
;define("client/helpers/is-equal", ["exports", "ember-truth-helpers/helpers/is-equal"], function (_exports, _isEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEqual.default;
    }
  });
  Object.defineProperty(_exports, "isEqual", {
    enumerable: true,
    get: function () {
      return _isEqual.isEqual;
    }
  });
});
;define("client/helpers/lt", ["exports", "ember-truth-helpers/helpers/lt"], function (_exports, _lt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lt.default;
    }
  });
  Object.defineProperty(_exports, "lt", {
    enumerable: true,
    get: function () {
      return _lt.lt;
    }
  });
});
;define("client/helpers/lte", ["exports", "ember-truth-helpers/helpers/lte"], function (_exports, _lte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lte.default;
    }
  });
  Object.defineProperty(_exports, "lte", {
    enumerable: true,
    get: function () {
      return _lte.lte;
    }
  });
});
;define("client/helpers/not-eq", ["exports", "ember-truth-helpers/helpers/not-equal"], function (_exports, _notEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _notEqual.default;
    }
  });
  Object.defineProperty(_exports, "notEq", {
    enumerable: true,
    get: function () {
      return _notEqual.notEq;
    }
  });
});
;define("client/helpers/not", ["exports", "ember-truth-helpers/helpers/not"], function (_exports, _not) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _not.default;
    }
  });
  Object.defineProperty(_exports, "not", {
    enumerable: true,
    get: function () {
      return _not.not;
    }
  });
});
;define("client/helpers/or", ["exports", "ember-truth-helpers/helpers/or"], function (_exports, _or) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _or.default;
    }
  });
  Object.defineProperty(_exports, "or", {
    enumerable: true,
    get: function () {
      return _or.or;
    }
  });
});
;define("client/helpers/pluralize", ["exports", "ember-inflector/lib/helpers/pluralize"], function (_exports, _pluralize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _pluralize.default;
  _exports.default = _default;
});
;define("client/helpers/singularize", ["exports", "ember-inflector/lib/helpers/singularize"], function (_exports, _singularize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _singularize.default;
  _exports.default = _default;
});
;define("client/helpers/xor", ["exports", "ember-truth-helpers/helpers/xor"], function (_exports, _xor) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _xor.default;
    }
  });
  Object.defineProperty(_exports, "xor", {
    enumerable: true,
    get: function () {
      return _xor.xor;
    }
  });
});
;define("client/initializers/app-version", ["exports", "ember-cli-app-version/initializer-factory", "client/config/environment"], function (_exports, _initializerFactory, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  let name, version;

  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  var _default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
  _exports.default = _default;
});
;define("client/initializers/container-debug-adapter", ["exports", "ember-resolver/resolvers/classic/container-debug-adapter"], function (_exports, _containerDebugAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];
      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }

  };
  _exports.default = _default;
});
;define("client/initializers/ember-data", ["exports", "ember-data/setup-container", "ember-data"], function (_exports, _setupContainer, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    ```app/services/store.js
    import DS from 'ember-data';
  
    export default DS.Store.extend({
      adapter: 'custom'
    });
    ```
  
    ```app/controllers/posts.js
    import { Controller } from '@ember/controller';
  
    export default Controller.extend({
      // ...
    });
  
    When the application is initialized, `ApplicationStore` will automatically be
    instantiated, and the instance of `PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */
  var _default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
  _exports.default = _default;
});
;define("client/initializers/export-application-global", ["exports", "client/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.initialize = initialize;
  _exports.default = void 0;

  function initialize() {
    var application = arguments[1] || arguments[0];

    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;

      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;
        application.reopen({
          willDestroy: function () {
            this._super.apply(this, arguments);

            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  var _default = {
    name: 'export-application-global',
    initialize: initialize
  };
  _exports.default = _default;
});
;define("client/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (_exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'ember-data',
    initialize: _initializeStoreService.default
  };
  _exports.default = _default;
});
;define("client/models/entry", ["exports", "ember-data"], function (_exports, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const {
    Model
  } = _emberData.default;

  var _default = Model.extend({
    name: _emberData.default.attr('string'),
    strategy: _emberData.default.belongsTo('strategy'),
    trade: _emberData.default.belongsTo('trade'),
    stock: _emberData.default.belongsTo('stock'),
    counter: _emberData.default.belongsTo('strategy'),
    status: _emberData.default.attr()
  });

  _exports.default = _default;
});
;define("client/models/operand", ["exports", "ember-data"], function (_exports, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const {
    Model
  } = _emberData.default;

  var _default = Model.extend({
    name: _emberData.default.attr(),
    value: _emberData.default.attr(),
    arguments: _emberData.default.attr()
  });

  _exports.default = _default;
});
;define("client/models/operation", ["exports", "ember-data"], function (_exports, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const {
    Model
  } = _emberData.default;

  var _default = Model.extend({
    left: _emberData.default.attr(),
    right: _emberData.default.attr(),
    operand: _emberData.default.attr()
  });

  _exports.default = _default;
});
;define("client/models/stock", ["exports", "ember-data"], function (_exports, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const {
    Model
  } = _emberData.default;

  var _default = Model.extend({
    name: _emberData.default.attr(),
    token: _emberData.default.attr(),
    type: _emberData.default.attr(),
    exchange: _emberData.default.attr(),
    ticksize: _emberData.default.attr()
  });

  _exports.default = _default;
});
;define("client/models/strategy", ["exports", "ember-data"], function (_exports, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const {
    Model
  } = _emberData.default;

  var _default = Model.extend({
    name: _emberData.default.attr(),
    beginOn: _emberData.default.attr(),
    endOn: _emberData.default.attr(),
    operation: _emberData.default.attr(),
    type: _emberData.default.attr()
  });

  _exports.default = _default;
});
;define("client/models/trade", ["exports", "ember-data"], function (_exports, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const {
    Model
  } = _emberData.default;

  var _default = Model.extend({
    name: _emberData.default.attr(),
    price: _emberData.default.attr(),
    target: _emberData.default.attr(),
    stoploss: _emberData.default.attr(),
    quantity: _emberData.default.attr(),
    trader: _emberData.default.attr()
  });

  _exports.default = _default;
});
;define("client/resolver", ["exports", "ember-resolver"], function (_exports, _emberResolver) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _emberResolver.default;
  _exports.default = _default;
});
;define("client/router", ["exports", "client/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });
  Router.map(function () {
    this.route('dashboard', function () {
      this.route('strategy');
      this.route('trade');
      this.route('entry', function () {});
      this.route('backtest');
    });
  });
  var _default = Router;
  _exports.default = _default;
});
;define("client/routes/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({});

  _exports.default = _default;
});
;define("client/routes/dashboard", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    model: function () {
      let model = [{
        display: 'Entries',
        route: 'dashboard.entry'
      }, {
        display: 'Strategy',
        route: "dashboard.strategy"
      }, {
        display: "Trade",
        route: "dashboard.trade"
      }, {
        display: 'BackTesting',
        route: "dashboard.backtest"
      }];
      return model;
    }
  });

  _exports.default = _default;
});
;define("client/routes/dashboard/backtest", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({});

  _exports.default = _default;
});
;define("client/routes/dashboard/entry", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    beforeModel: function () {},
    model: function () {
      return Ember.RSVP.hash({
        entries: this.store.findAll("entry"),
        strategies: this.store.findAll('strategy'),
        trades: this.store.findAll('trade'),
        stocks: this.store.peekAll('stock')
      });
    }
  });

  _exports.default = _default;
});
;define("client/routes/dashboard/strategy", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    model: function () {
      return this.store.findAll('strategy');
    }
  });

  _exports.default = _default;
});
;define("client/routes/dashboard/trade", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    beforeModel: function () {},
    model: function () {
      return this.store.findAll('trade');
    }
  });

  _exports.default = _default;
});
;define("client/routes/strategy/create", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    model: function () {}
  });

  _exports.default = _default;
});
;define("client/serializers/application", ["exports", "ember-data"], function (_exports, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _emberData.default.RESTSerializer.extend({
    extractId: function (modelClass, resourceHash) {
      return resourceHash['_id'];
    },
    normalizeResponse: function (store, primaryModelClass, payload, id, requestType) {
      delete payload.status;
      return this._super(store, primaryModelClass, payload, id, requestType);
    }
  });

  _exports.default = _default;
});
;define("client/serializers/strategy", ["exports", "client/serializers/application"], function (_exports, _application) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _application.default.extend({
    normalize: function (modelClass, resourceHash) {
      resourceHash.operation = resourceHash.operation && this.get_as_object(JSON.parse(resourceHash.operation));
      resourceHash.beginOn = resourceHash.beginOn && this.get_as_object(JSON.parse(resourceHash.beginOn));
      resourceHash.endOn = resourceHash.endOn && this.get_as_object(JSON.parse(resourceHash.endOn));
      return this._super(modelClass, resourceHash);
    },
    serialize: function (snapshot, options) {
      let r = this._super(snapshot, options);

      r.beginOn = JSON.stringify(this.get_as_array(r.beginOn));
      r.endOn = JSON.stringify(this.get_as_array(r.endOn));
      r.operation = JSON.stringify(this.get_as_array(r.operation));
      return r;
    },
    get_as_object: function (array) {
      var object = {};

      if (Array.isArray(array)) {
        object['left'] = this.get_as_object(array[0]);
        object['right'] = this.get_as_object(array[2]);
        object['operator'] = array[1];
      } else {
        object = array;
        object.args = object.args || [];
        object.args = object.args.join(',');
      }

      return object;
    },
    get_as_array: function (object) {
      var array;

      if (object.operator) {
        array = [this.get_as_array(object.left), object.operator, this.get_as_array(object.right)];
      } else {
        array = JSON.parse(JSON.stringify(object));
        array.args = array.args.split(',');
      }

      return array;
    }
  });

  _exports.default = _default;
});
;define("client/serializers/trade", ["exports", "client/serializers/application"], function (_exports, _application) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _application.default.extend({
    normalize: function (modelClass, resourceHash) {
      resourceHash.price = resourceHash.price && typeof resourceHash.price == 'string' && this.get_as_object(JSON.parse(resourceHash.price)[0]) || resourceHash.price || {};
      resourceHash.target = resourceHash.target && typeof resourceHash.target == 'string' && this.get_as_object(JSON.parse(resourceHash.target)[0]) || resourceHash.target || {};
      resourceHash.stoploss = resourceHash.stoploss && typeof resourceHash.stoploss == 'string' && this.get_as_object(JSON.parse(resourceHash.stoploss)[0]) || resourceHash.stoploss || {};
      return this._super(modelClass, resourceHash);
    },
    serialize: function (snapshot, options) {
      let r = this._super(snapshot, options);

      r.price = this.getSerialized(r.price);
      r.target = this.getSerialized(r.target);
      r.stoploss = this.getSerialized(r.stoploss);
      return r;
    },
    getSerialized: function (value) {
      if (typeof value == 'string' || typeof value == 'number') {
        return parseFloat(value);
      } else if (value.hasOwnProperty('func')) {
        value = JSON.parse(JSON.stringify(value));
        console.log(value);
        return JSON.stringify([(value.args = value.args.split(','), value)]);
      } else {
        return JSON.stringify(this.get_as_array(value));
      }
    },
    get_as_object: function (value) {
      var object = {};

      if (Array.isArray(value)) {
        object['left'] = this.get_as_object(value[0]);
        object['right'] = this.get_as_object(value[2]);
        object['operator'] = value[1];
      } else if (typeof value == 'object') {
        object = value;
        object.args = object.args || [];
        object.args = object.args.join(',');
      } else {
        object = [value];
      }

      return object;
    },
    get_as_array: function (object) {
      var array;

      if (object.left || object.operator || object.right) {
        array = [];
        if (object.left) array.push(this.get_as_array(object.left));
        if (object.operator) array.push(pbject.operator);
        if (object.right) array.push(this.get_as_array(object.right));
        if (array.length == 1) array = array[0];
      } else {
        array = JSON.parse(JSON.stringify(object));
        array.args = array.args.split(',');
      }

      return array;
    }
  });

  _exports.default = _default;
});
;define("client/templates/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "xUAYupb2",
    "block": "{\"symbols\":[],\"statements\":[[1,[22,\"outlet\"],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/application.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/entry-record", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "NBz0kF17",
    "block": "{\"symbols\":[\"property\"],\"statements\":[[7,\"div\",true],[10,\"class\",\"entry-record-icons\"],[8],[0,\"\\n    \"],[7,\"button\",false],[3,\"action\",[[23,0,[]],\"editEntry\",[24,[\"entry\"]]]],[8],[0,\"Edit\"],[9],[0,\"\\n    \"],[7,\"button\",false],[3,\"action\",[[23,0,[]],\"deleteEntry\",[24,[\"entry\"]]]],[8],[0,\"Delete\"],[9],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"p\",true],[10,\"class\",\"entry-record--title\"],[8],[1,[24,[\"entry\",\"name\"]],false],[9],[0,\"\\n\"],[7,\"p\",true],[10,\"class\",\"entry-properties\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"properties\"]]],null,{\"statements\":[[0,\"        \"],[1,[28,\"property-component\",null,[[\"label\",\"value\",\"meta\"],[[23,1,[\"label\"]],[23,1,[\"value\",\"name\"]],[23,1,[\"meta\"]]]]],false],[0,\"\\n\"]],\"parameters\":[1]},null],[9],[0,\"\\n\"],[7,\"button\",true],[11,\"class\",[29,[\"entry-record-status \",[22,\"statusClass\"]]]],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"toggleStatus\"],null]],[11,\"title\",[22,\"statusTitle\"]],[8],[0,\" \"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/entry-record.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/entry-row", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "snjhT5qN",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[14,1]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/entry-row.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/entry-wrapper", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "dYSjHf4m",
    "block": "{\"symbols\":[\"stock\",\"trade\",\"index\",\"counter\",\"index\",\"strategy\",\"index\",\"entry\"],\"statements\":[[7,\"div\",true],[10,\"class\",\"entry-container flex-row flex-wrap\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"model\",\"entries\"]]],null,{\"statements\":[[0,\"        \"],[1,[28,\"entry-record\",null,[[\"entry\",\"edit\",\"delete\"],[[23,8,[]],[28,\"action\",[[23,0,[]],\"edit\"],null],[28,\"action\",[[23,0,[]],\"delete\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[8]},null],[4,\"if\",[[24,[\"editModel\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\",true],[10,\"class\",\"edit-panel\"],[8],[0,\"\\n            \"],[7,\"button\",false],[12,\"class\",\"edit-panel--close\"],[3,\"action\",[[23,0,[]],\"editClose\"]],[8],[0,\"X\"],[9],[0,\"\\n            \"],[7,\"p\",true],[10,\"class\",\"edit-panel--title\"],[8],[0,\"Edit Panel\"],[9],[0,\"\\n            \"],[7,\"div\",true],[10,\"class\",\"edit-panel--form\"],[8],[0,\"\\n                \"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n                    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Name\"],[9],[0,\"\\n                    \"],[1,[28,\"input\",null,[[\"value\",\"class\"],[[24,[\"editModel\",\"name\"]],\"edit-panel--input\"]]],false],[0,\"\\n                \"],[9],[0,\"\\n                \"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n                    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Strategy\"],[9],[0,\"\\n\"],[0,\"                    \"],[7,\"select\",true],[10,\"class\",\"edit-panel--input\"],[10,\"id\",\"strategy-list\"],[11,\"onchange\",[28,\"action\",[[23,0,[]],\"getHashFromOptions\",\"strategy\",\"strategies\"],null]],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"strategies\"]]],null,{\"statements\":[[0,\"                        \"],[7,\"option\",true],[11,\"value\",[23,7,[]]],[11,\"selected\",[28,\"if\",[[28,\"eq\",[[23,6,[\"name\"]],[24,[\"editModel\",\"strategy\",\"name\"]]],null],\"selected\"],null]],[8],[1,[23,6,[\"name\"]],false],[9],[0,\"\\n\"]],\"parameters\":[6,7]},null],[0,\"                    \"],[9],[0,\"\\n                \"],[9],[0,\"\\n                \"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n                    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Counter\"],[9],[0,\"\\n                    \"],[7,\"select\",true],[10,\"class\",\"edit-panel--input\"],[10,\"id\",\"counter-list\"],[11,\"onchange\",[28,\"action\",[[23,0,[]],\"getHashFromOptions\",\"counter\",\"counters\"],null]],[8],[0,\"\\n                        \"],[7,\"option\",true],[10,\"value\",\"-1\"],[10,\"selected\",\"selected\"],[8],[0,\"-- No counter strategy --\"],[9],[0,\"\\n\"],[4,\"each\",[[24,[\"counters\"]]],null,{\"statements\":[[0,\"                        \"],[7,\"option\",true],[11,\"value\",[23,5,[]]],[11,\"selected\",[28,\"if\",[[28,\"eq\",[[23,4,[\"name\"]],[24,[\"editModel\",\"counter\",\"name\"]]],null],\"selected\"],null]],[8],[1,[23,4,[\"name\"]],false],[0,\"\\n                        \"],[9],[0,\"\\n\"]],\"parameters\":[4,5]},null],[0,\"                    \"],[9],[0,\"\\n                \"],[9],[0,\"\\n                \"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n                    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Trade\"],[9],[0,\"\\n                    \"],[7,\"select\",true],[10,\"class\",\"edit-panel--input\"],[10,\"id\",\"trade-list\"],[11,\"onchange\",[28,\"action\",[[23,0,[]],\"getHashFromOptions\",\"trade\",\"trades\"],null]],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"trades\"]]],null,{\"statements\":[[0,\"                        \"],[7,\"option\",true],[11,\"value\",[23,3,[]]],[11,\"selected\",[28,\"if\",[[28,\"eq\",[[23,2,[\"name\"]],[24,[\"editModel\",\"trade\",\"name\"]]],null],\"selected\"],null]],[8],[1,[23,2,[\"name\"]],false],[9],[0,\"\\n\"]],\"parameters\":[2,3]},null],[0,\"                    \"],[9],[0,\"\\n\"],[0,\"                \"],[9],[0,\"\\n                \"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n                    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Stock\"],[9],[0,\"\\n                    \"],[1,[28,\"input\",null,[[\"class\",\"key-up\",\"value\",\"disabled\"],[\"edit-panel--input\",[28,\"action\",[[23,0,[]],\"formInput\",\"stocks\"],null],[24,[\"editModel\",\"stock\",\"name\"]],\"disabled\"]]],false],[0,\"\\n                    \"],[7,\"div\",true],[10,\"class\",\"edit-panel--search\"],[8],[0,\"\\n                        \"],[1,[28,\"input\",null,[[\"list\",\"id\",\"class\",\"key-up\"],[\"stock-list\",\"stock-input\",\"edit-panel--search__input\",[28,\"action\",[[23,0,[]],\"formInput\",\"stock\"],null]]]],false],[0,\"\\n                        \"],[7,\"div\",true],[10,\"class\",\"edit-panel--search__output\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"stocks\"]]],null,{\"statements\":[[0,\"                                \"],[7,\"p\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"selectHash\",\"stock\",[23,1,[]]],null]],[8],[1,[23,1,[\"name\"]],false],[9],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"                        \"],[9],[0,\"\\n                    \"],[9],[0,\"\\n\"],[0,\"                \"],[9],[0,\"\\n            \"],[9],[0,\"\\n        \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[7,\"button\",false],[12,\"class\",\"new-entry-button\"],[3,\"action\",[[23,0,[]],\"newEntry\"]],[8],[0,\"\\n        + New Entry\\n    \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/entry-wrapper.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/operand", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "LrFVkr7F",
    "block": "{\"symbols\":[],\"statements\":[[1,[28,\"input\",null,[[\"type\",\"value\"],[\"text\",[24,[\"data\",\"func\"]]]]],false],[0,\"\\n\"],[1,[28,\"input\",null,[[\"type\",\"value\"],[\"text\",[24,[\"data\",\"args\"]]]]],false],[0,\"\\n\"],[7,\"button\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"add\"],null]],[8],[0,\"+\"],[9],[0,\"\\n\"],[7,\"button\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"close\"],null]],[8],[0,\"x\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/operand.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/operation", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "4JqDAYuV",
    "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[24,[\"left\"]]],null,{\"statements\":[[0,\"    \"],[1,[28,\"component\",[[24,[\"leftComponent\"]]],[[\"data\",\"close\",\"add\",\"changed\"],[[24,[\"left\"]],[28,\"action\",[[23,0,[]],\"close\",\"left\"],null],[28,\"action\",[[23,0,[]],\"add\",\"left\"],null],[28,\"action\",[[23,0,[]],\"changed\",\"left\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[24,[\"data\",\"operator\"]]],null,{\"statements\":[[0,\"    \"],[1,[28,\"operator\",null,[[\"model\"],[[24,[\"data\",\"operator\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[24,[\"right\"]]],null,{\"statements\":[[0,\"    \"],[1,[28,\"component\",[[24,[\"rightComponent\"]]],[[\"data\",\"close\",\"add\",\"changed\"],[[24,[\"right\"]],[28,\"action\",[[23,0,[]],\"close\",\"right\"],null],[28,\"action\",[[23,0,[]],\"add\",\"right\"],null],[28,\"action\",[[23,0,[]],\"changed\",\"right\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/operation.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/operator", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "3VpKKKq5",
    "block": "{\"symbols\":[\"o\"],\"statements\":[[0,\"\\n\"],[7,\"select\",true],[11,\"onchange\",[28,\"action\",[[23,0,[]],\"changed\"],null]],[10,\"class\",\"operator-box\"],[11,\"value\",[22,\"model\"]],[8],[0,\"\\n    \"],[1,[28,\"log\",[[24,[\"model\"]]],null],false],[0,\"\\n\"],[4,\"each\",[[24,[\"select_options\"]]],null,{\"statements\":[[0,\"        \"],[7,\"option\",true],[11,\"value\",[23,1,[\"label\"]]],[11,\"selected\",[28,\"if\",[[28,\"eq\",[[24,[\"model\"]],[23,1,[\"label\"]]],null],true,false],null]],[8],[1,[23,1,[\"value\"]],false],[9],[0,\"\\n\"]],\"parameters\":[1]},null],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/operator.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/property-component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "d9Bn6LLn",
    "block": "{\"symbols\":[],\"statements\":[[7,\"label\",true],[10,\"class\",\"property-key\"],[8],[1,[22,\"label\"],false],[9],[0,\" : \\n\"],[7,\"p\",true],[10,\"class\",\"property-value\"],[8],[1,[22,\"value\"],false],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/property-component.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/strategy-component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "d3WiarXt",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Name\"],[9],[0,\"\\n    \"],[1,[28,\"input\",null,[[\"type\",\"value\"],[\"text\",[24,[\"strategy\",\"name\"]]]]],false],[0,\"\\n     \\n    \"],[7,\"button\",false],[3,\"action\",[[23,0,[]],\"toggleType\"]],[8],[1,[24,[\"strategy\",\"type\"]],false],[9],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Logic\"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"strategy\",\"operation\"]]],null,{\"statements\":[[0,\"        \"],[1,[28,\"operation\",null,[[\"data\",\"changed\"],[[24,[\"strategy\",\"operation\"]],[28,\"action\",[[23,0,[]],\"changed\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Begin On\"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"strategy\",\"beginOn\"]]],null,{\"statements\":[[0,\"        \"],[1,[28,\"operation\",null,[[\"data\",\"changed\"],[[24,[\"strategy\",\"beginOn\"]],[28,\"action\",[[23,0,[]],\"changed\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"End On\"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"strategy\",\"endOn\"]]],null,{\"statements\":[[0,\"        \"],[1,[28,\"operation\",null,[[\"data\",\"changed\"],[[24,[\"strategy\",\"endOn\"]],[28,\"action\",[[23,0,[]],\"changed\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/strategy-component.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/strategy-wrapper", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "mwpeYcro",
    "block": "{\"symbols\":[\"strategy\"],\"statements\":[[7,\"div\",true],[10,\"class\",\"flex-column\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"header\"],[8],[0,\"\\n        Strategy\\n    \"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"container flex-row\"],[8],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"left-tree\"],[8],[0,\"\\n            \"],[7,\"div\",true],[10,\"class\",\"left-tree-panel\"],[8],[0,\"\\n                \"],[7,\"span\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"newStrategy\"],null]],[8],[0,\"New\"],[9],[0,\"\\n            \"],[9],[0,\"\\n            \"],[7,\"ul\",true],[10,\"id\",\"strategy-list\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"model\"]]],null,{\"statements\":[[4,\"if\",[[23,1,[]]],null,{\"statements\":[[0,\"                        \"],[7,\"li\",true],[11,\"class\",[29,[\"flex-row \",[28,\"if\",[[28,\"eq\",[[24,[\"currentStrategy\"]],[23,1,[]]],null],\"li-selected\"],null]]]],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"showStrategy\",[23,1,[]]],null]],[8],[0,\"\\n                            \"],[7,\"div\",true],[10,\"class\",\"flex-fill-width\"],[8],[1,[23,1,[\"name\"]],false],[9],[0,\"\\n                            \"],[7,\"button\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"deleteStrategy\",[23,1,[]]],null]],[8],[0,\"X\"],[9],[0,\"\\n                        \"],[9],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[1]},null],[0,\"            \"],[9],[0,\"\\n        \"],[9],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"container-body\"],[10,\"id\",\"strategy-display\"],[8],[0,\"\\n            \"],[7,\"div\",true],[10,\"style\",\"padding: 8px;\"],[8],[0,\"\\n\"],[4,\"if\",[[28,\"not-eq\",[[24,[\"currentStrategy\"]],[24,[\"nothing\"]]],null]],null,{\"statements\":[[0,\"                    \"],[1,[28,\"strategy-component\",null,[[\"strategy\"],[[24,[\"currentStrategy\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                    Nothing\\n\"]],\"parameters\":[]}],[0,\"            \"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"currentStrategy\"]]],null,{\"statements\":[[0,\"                \"],[7,\"div\",true],[10,\"style\",\"position:absolute;right: 4px; bottom: 4px;font-size: 20px;\"],[8],[0,\"\\n                    \"],[7,\"button\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"resetStrategy\"],null]],[8],[0,\"Reset\"],[9],[0,\"\\n                    \"],[7,\"button\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"saveStrategy\"],null]],[8],[0,\"Save\"],[9],[0,\"\\n                \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"        \"],[9],[0,\"\\n    \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/strategy-wrapper.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/tab-component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "Mc21jW7J",
    "block": "{\"symbols\":[\"tab\",\"&default\"],\"statements\":[[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"tab-component\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"tab-container flex-row\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"tabs\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\",true],[10,\"class\",\"tab-link\"],[8],[0,\"\\n                \"],[4,\"link-to\",null,[[\"route\"],[[23,1,[\"route\"]]]],{\"statements\":[[0,\" \"],[1,[23,1,[\"display\"]],false],[0,\" \"]],\"parameters\":[]},null],[0,\"\\n            \"],[9],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"    \"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"tab-display\"],[8],[14,2],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/tab-component.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/trade-component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "Jv6I9lrD",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Name\"],[9],[0,\"\\n    \"],[1,[28,\"input\",null,[[\"type\",\"value\"],[\"text\",[24,[\"trade\",\"name\"]]]]],false],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Price\"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"priceComp\"]]],null,{\"statements\":[[0,\"        \"],[1,[28,\"component\",[[24,[\"priceComp\"]]],[[\"data\",\"add\"],[[24,[\"trade\",\"price\"]],[28,\"action\",[[23,0,[]],\"add\",\"price\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[1,[28,\"input\",null,[[\"type\",\"value\"],[\"text\",[24,[\"trade\",\"price\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[7,\"button\",false],[3,\"action\",[[23,0,[]],\"toggleLogic\",\"price\"]],[8],[0,\"Toggle\"],[9],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Target\"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"targetComp\"]]],null,{\"statements\":[[0,\"        \"],[1,[28,\"component\",[[24,[\"targetComp\"]]],[[\"data\",\"add\"],[[24,[\"trade\",\"target\"]],[28,\"action\",[[23,0,[]],\"add\",\"target\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[1,[28,\"input\",null,[[\"type\",\"value\"],[\"text\",[24,[\"trade\",\"target\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[7,\"button\",false],[3,\"action\",[[23,0,[]],\"toggleLogic\",\"target\"]],[8],[0,\"Toggle\"],[9],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"list-item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"list-label\"],[8],[0,\"Stop Loss\"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"stoplossComp\"]]],null,{\"statements\":[[0,\"        \"],[1,[28,\"component\",[[24,[\"stoplossComp\"]]],[[\"data\",\"add\"],[[24,[\"trade\",\"stoploss\"]],[28,\"action\",[[23,0,[]],\"add\",\"stoploss\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[1,[28,\"input\",null,[[\"type\",\"value\"],[\"text\",[24,[\"trade\",\"stoploss\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[7,\"button\",false],[3,\"action\",[[23,0,[]],\"toggleLogic\",\"stoploss\"]],[8],[0,\"Toggle\"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/trade-component.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/components/trade-wrapper", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "V4cFL8+n",
    "block": "{\"symbols\":[\"trade\"],\"statements\":[[7,\"div\",true],[10,\"class\",\"flex-column\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"header\"],[8],[0,\"\\n        Trade\\n    \"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"container flex-row\"],[8],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"left-tree\"],[8],[0,\"\\n            \"],[7,\"div\",true],[10,\"class\",\"left-tree-panel\"],[8],[0,\"\\n                \"],[7,\"span\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"newTrade\"],null]],[8],[0,\"New\"],[9],[0,\"\\n            \"],[9],[0,\"\\n            \"],[7,\"ul\",true],[10,\"id\",\"trade-list\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"model\"]]],null,{\"statements\":[[4,\"if\",[[23,1,[]]],null,{\"statements\":[[0,\"                    \"],[7,\"li\",true],[11,\"class\",[29,[\"flex-row \",[28,\"if\",[[28,\"eq\",[[24,[\"currentTrade\"]],[23,1,[]]],null],\"li-selected\"],null]]]],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"showTrade\",[23,1,[]]],null]],[8],[0,\"\\n                        \"],[7,\"div\",true],[10,\"class\",\"flex-fill-width\"],[8],[1,[23,1,[\"name\"]],false],[9],[0,\"\\n                        \"],[7,\"button\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"deleteTrade\",[23,1,[]]],null]],[8],[0,\"X\"],[9],[0,\"\\n                    \"],[9],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[1]},null],[0,\"            \"],[9],[0,\"\\n        \"],[9],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"container-body\"],[10,\"id\",\"trade-display\"],[8],[0,\"\\n            \"],[7,\"div\",true],[10,\"style\",\"padding: 8px;\"],[8],[0,\"\\n\"],[4,\"if\",[[28,\"not-eq\",[[24,[\"currentTrade\"]],[24,[\"nothing\"]]],null]],null,{\"statements\":[[0,\"                    \"],[1,[28,\"trade-component\",null,[[\"trade\"],[[24,[\"currentTrade\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                    Nothing\\n\"]],\"parameters\":[]}],[0,\"            \"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"currentTrade\"]]],null,{\"statements\":[[0,\"                \"],[7,\"div\",true],[10,\"style\",\"position:absolute;right: 4px; bottom: 4px;font-size: 20px;\"],[8],[0,\"\\n                    \"],[7,\"button\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"resetTrade\"],null]],[8],[0,\"Reset\"],[9],[0,\"\\n                    \"],[7,\"button\",true],[11,\"onclick\",[28,\"action\",[[23,0,[]],\"saveTrade\"],null]],[8],[0,\"Save\"],[9],[0,\"\\n                \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"        \"],[9],[0,\"\\n    \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/components/trade-wrapper.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/dashboard", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "/bfBHl+n",
    "block": "{\"symbols\":[],\"statements\":[[4,\"tab-component\",null,[[\"tabs\"],[[24,[\"model\"]]]],{\"statements\":[[0,\"    \"],[1,[22,\"outlet\"],false],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/dashboard.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/dashboard/backtest", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "4ce/qMSf",
    "block": "{\"symbols\":[],\"statements\":[[1,[22,\"outlet\"],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/dashboard/backtest.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/dashboard/entry", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "benPpHYx",
    "block": "{\"symbols\":[],\"statements\":[[1,[28,\"entry-wrapper\",null,[[\"model\"],[[24,[\"model\"]]]]],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/dashboard/entry.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/dashboard/strategy", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "AGZaFzAd",
    "block": "{\"symbols\":[],\"statements\":[[1,[28,\"strategy-wrapper\",null,[[\"model\"],[[24,[\"model\"]]]]],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/dashboard/strategy.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/dashboard/trade", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "kAWTl1AV",
    "block": "{\"symbols\":[],\"statements\":[[1,[28,\"trade-wrapper\",null,[[\"model\"],[[24,[\"model\"]]]]],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/dashboard/trade.hbs"
    }
  });

  _exports.default = _default;
});
;define("client/templates/strategy/create", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "ScKUhryN",
    "block": "{\"symbols\":[],\"statements\":[],\"hasEval\":false}",
    "meta": {
      "moduleName": "client/templates/strategy/create.hbs"
    }
  });

  _exports.default = _default;
});
;

;define('client/config/environment', [], function() {
  var prefix = 'client';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

;
          if (!runningTests) {
            require("client/app")["default"].create({"LOG_TRANSITIONS":true,"rootElement":"#ember-app","name":"client","version":"0.0.0+6a4a5364"});
          }
        
//# sourceMappingURL=client.map
