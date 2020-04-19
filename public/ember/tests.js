'use strict';

define("client/tests/integration/components/entry-record-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | entry-record', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <EntryRecord />
      */
      {
        id: "QRNYobxl",
        block: "{\"symbols\":[],\"statements\":[[5,\"entry-record\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <EntryRecord>
              template block text
            </EntryRecord>
          
      */
      {
        id: "0ZFNJQIU",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"entry-record\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/entry-row-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | entry-row', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <EntryRow />
      */
      {
        id: "iVv5ipGp",
        block: "{\"symbols\":[],\"statements\":[[5,\"entry-row\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <EntryRow>
              template block text
            </EntryRow>
          
      */
      {
        id: "NVN1zo5S",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"entry-row\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/entry-wrapper-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | entry-wrapper', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <EntryWrapper />
      */
      {
        id: "B5NIzjtk",
        block: "{\"symbols\":[],\"statements\":[[5,\"entry-wrapper\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <EntryWrapper>
              template block text
            </EntryWrapper>
          
      */
      {
        id: "VkSX/p+T",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"entry-wrapper\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/operand-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | operand', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <Operand />
      */
      {
        id: "EB3hXnS6",
        block: "{\"symbols\":[],\"statements\":[[5,\"operand\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <Operand>
              template block text
            </Operand>
          
      */
      {
        id: "8g4qV7RX",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"operand\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/operation-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | operation', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <Operation />
      */
      {
        id: "T41YfmSc",
        block: "{\"symbols\":[],\"statements\":[[5,\"operation\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <Operation>
              template block text
            </Operation>
          
      */
      {
        id: "Q+I8pueI",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"operation\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/operator-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | operator', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <Operator />
      */
      {
        id: "E/GS1kSz",
        block: "{\"symbols\":[],\"statements\":[[5,\"operator\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <Operator>
              template block text
            </Operator>
          
      */
      {
        id: "tMPwT87f",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"operator\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/property-component-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | property-component', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <PropertyComponent />
      */
      {
        id: "XMMa5TbQ",
        block: "{\"symbols\":[],\"statements\":[[5,\"property-component\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <PropertyComponent>
              template block text
            </PropertyComponent>
          
      */
      {
        id: "ju6m+K2L",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"property-component\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/strategy-component-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | strategy-component', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <StrategyComponent />
      */
      {
        id: "XiAmhdJU",
        block: "{\"symbols\":[],\"statements\":[[5,\"strategy-component\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <StrategyComponent>
              template block text
            </StrategyComponent>
          
      */
      {
        id: "zps0zYLc",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"strategy-component\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/strategy-wrapper-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | strategy-wrapper', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <StrategyWrapper />
      */
      {
        id: "SkQsHNDp",
        block: "{\"symbols\":[],\"statements\":[[5,\"strategy-wrapper\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <StrategyWrapper>
              template block text
            </StrategyWrapper>
          
      */
      {
        id: "kshLFytc",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"strategy-wrapper\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/tab-component-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | tab-component', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <TabComponent />
      */
      {
        id: "cOP02lX2",
        block: "{\"symbols\":[],\"statements\":[[5,\"tab-component\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <TabComponent>
              template block text
            </TabComponent>
          
      */
      {
        id: "TNio7LKR",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"tab-component\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/trade-component-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | trade-component', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <TradeComponent />
      */
      {
        id: "MmFRuMK3",
        block: "{\"symbols\":[],\"statements\":[[5,\"trade-component\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <TradeComponent>
              template block text
            </TradeComponent>
          
      */
      {
        id: "lHNW6vvu",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"trade-component\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/integration/components/trade-wrapper-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | trade-wrapper', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        <TradeWrapper />
      */
      {
        id: "ua1knTgW",
        block: "{\"symbols\":[],\"statements\":[[5,\"trade-wrapper\",[],[[],[]]]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        
            <TradeWrapper>
              template block text
            </TradeWrapper>
          
      */
      {
        id: "mV/LEgpP",
        block: "{\"symbols\":[],\"statements\":[[0,\"\\n      \"],[5,\"trade-wrapper\",[],[[],[]],{\"statements\":[[0,\"\\n        template block text\\n      \"]],\"parameters\":[]}],[0,\"\\n    \"]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("client/tests/lint/app.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | app');
  QUnit.test('adapters/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/application.js should pass ESLint\n\n');
  });
  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });
  QUnit.test('client-data/operator-options.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'client-data/operator-options.js should pass ESLint\n\n');
  });
  QUnit.test('components/entry-record.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/entry-record.js should pass ESLint\n\n14:17 - Use brace expansion (ember/use-brace-expansion)');
  });
  QUnit.test('components/entry-row.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/entry-row.js should pass ESLint\n\n');
  });
  QUnit.test('components/entry-wrapper.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/entry-wrapper.js should pass ESLint\n\n36:17 - \'r\' is assigned a value but never used. (no-unused-vars)');
  });
  QUnit.test('components/operand.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/operand.js should pass ESLint\n\n');
  });
  QUnit.test('components/operation.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/operation.js should pass ESLint\n\n29:32 - \'event\' is defined but never used. (no-unused-vars)\n38:30 - \'event\' is defined but never used. (no-unused-vars)\n42:17 - Use `import { set } from \'@ember/object\';` instead of using Ember.set (ember/new-module-imports)\n42:17 - \'Ember\' is not defined. (no-undef)\n45:17 - Use `import { set } from \'@ember/object\';` instead of using Ember.set (ember/new-module-imports)\n45:17 - \'Ember\' is not defined. (no-undef)\n49:13 - Use `import { set } from \'@ember/object\';` instead of using Ember.set (ember/new-module-imports)\n49:13 - \'Ember\' is not defined. (no-undef)');
  });
  QUnit.test('components/operator.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/operator.js should pass ESLint\n\n');
  });
  QUnit.test('components/property-component.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/property-component.js should pass ESLint\n\n');
  });
  QUnit.test('components/strategy-component.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/strategy-component.js should pass ESLint\n\n');
  });
  QUnit.test('components/strategy-wrapper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/strategy-wrapper.js should pass ESLint\n\n');
  });
  QUnit.test('components/tab-component.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/tab-component.js should pass ESLint\n\n');
  });
  QUnit.test('components/trade-component.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/trade-component.js should pass ESLint\n\n68:11 - Use `import { set } from \'@ember/object\';` instead of using Ember.set (ember/new-module-imports)\n68:11 - \'Ember\' is not defined. (no-undef)\n72:9 - Unexpected console statement. (no-console)\n78:11 - Use `import { set } from \'@ember/object\';` instead of using Ember.set (ember/new-module-imports)\n78:11 - \'Ember\' is not defined. (no-undef)\n81:11 - Use `import { set } from \'@ember/object\';` instead of using Ember.set (ember/new-module-imports)\n81:11 - \'Ember\' is not defined. (no-undef)\n84:11 - Use `import { set } from \'@ember/object\';` instead of using Ember.set (ember/new-module-imports)\n84:11 - \'Ember\' is not defined. (no-undef)');
  });
  QUnit.test('components/trade-wrapper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/trade-wrapper.js should pass ESLint\n\n');
  });
  QUnit.test('models/entry.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/entry.js should pass ESLint\n\n');
  });
  QUnit.test('models/operand.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/operand.js should pass ESLint\n\n');
  });
  QUnit.test('models/operation.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/operation.js should pass ESLint\n\n');
  });
  QUnit.test('models/stock.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/stock.js should pass ESLint\n\n');
  });
  QUnit.test('models/strategy.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/strategy.js should pass ESLint\n\n');
  });
  QUnit.test('models/trade.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/trade.js should pass ESLint\n\n');
  });
  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });
  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });
  QUnit.test('routes/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/application.js should pass ESLint\n\n');
  });
  QUnit.test('routes/dashboard.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/dashboard.js should pass ESLint\n\n');
  });
  QUnit.test('routes/dashboard/backtest.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/dashboard/backtest.js should pass ESLint\n\n');
  });
  QUnit.test('routes/dashboard/entry.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/dashboard/entry.js should pass ESLint\n\n');
  });
  QUnit.test('routes/dashboard/strategy.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/dashboard/strategy.js should pass ESLint\n\n');
  });
  QUnit.test('routes/dashboard/trade.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/dashboard/trade.js should pass ESLint\n\n');
  });
  QUnit.test('routes/strategy/create.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/strategy/create.js should pass ESLint\n\n');
  });
  QUnit.test('serializers/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/application.js should pass ESLint\n\n');
  });
  QUnit.test('serializers/strategy.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/strategy.js should pass ESLint\n\n');
  });
  QUnit.test('serializers/trade.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'serializers/trade.js should pass ESLint\n\n22:7 - Unexpected console statement. (no-console)\n48:38 - \'pbject\' is not defined. (no-undef)');
  });
});
define("client/tests/lint/templates.template.lint-test", [], function () {
  "use strict";

  QUnit.module('TemplateLint');
  QUnit.test('client/templates/application.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'client/templates/application.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('client/templates/components/entry-record.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/entry-record.hbs should pass TemplateLint.\n\nclient/templates/components/entry-record.hbs\n  2:4  error  Incorrect indentation for `<button>` beginning at L2:C4. Expected `<button>` to be at an indentation of 2 but was found at 4.  block-indentation\n  3:4  error  Incorrect indentation for `<button>` beginning at L3:C4. Expected `<button>` to be at an indentation of 2 but was found at 4.  block-indentation\n  7:4  error  Incorrect indentation for `{{#each}}` beginning at L7:C4. Expected `{{#each}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  8:8  error  Incorrect indentation for `{{property-component}}` beginning at L8:C8. Expected `{{property-component}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  1:11  error  you must use double quotes in templates  quotes\n  2:21  error  you must use double quotes in templates  quotes\n  3:21  error  you must use double quotes in templates  quotes\n  5:9  error  you must use double quotes in templates  quotes\n  6:9  error  you must use double quotes in templates  quotes\n  11:14  error  you must use double quotes in templates  quotes\n  11:69  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/entry-row.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'client/templates/components/entry-row.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('client/templates/components/entry-wrapper.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/entry-wrapper.hbs should pass TemplateLint.\n\nclient/templates/components/entry-wrapper.hbs\n  2:4  error  Incorrect indentation for `{{#each}}` beginning at L2:C4. Expected `{{#each}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  5:4  error  Incorrect indentation for `{{#if}}` beginning at L5:C4. Expected `{{#if}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  63:4  error  Incorrect indentation for `<button>` beginning at L63:C4. Expected `<button>` to be at an indentation of 2 but was found at 4.  block-indentation\n  3:8  error  Incorrect indentation for `{{entry-record}}` beginning at L3:C8. Expected `{{entry-record}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  6:8  error  Incorrect indentation for `<div>` beginning at L6:C8. Expected `<div>` to be at an indentation of 6 but was found at 8.  block-indentation\n  7:12  error  Incorrect indentation for `<button>` beginning at L7:C12. Expected `<button>` to be at an indentation of 10 but was found at 12.  block-indentation\n  8:12  error  Incorrect indentation for `<p>` beginning at L8:C12. Expected `<p>` to be at an indentation of 10 but was found at 12.  block-indentation\n  9:12  error  Incorrect indentation for `<div>` beginning at L9:C12. Expected `<div>` to be at an indentation of 10 but was found at 12.  block-indentation\n  10:16  error  Incorrect indentation for `<div>` beginning at L10:C16. Expected `<div>` to be at an indentation of 14 but was found at 16.  block-indentation\n  14:16  error  Incorrect indentation for `<div>` beginning at L14:C16. Expected `<div>` to be at an indentation of 14 but was found at 16.  block-indentation\n  23:16  error  Incorrect indentation for `<div>` beginning at L23:C16. Expected `<div>` to be at an indentation of 14 but was found at 16.  block-indentation\n  33:16  error  Incorrect indentation for `<div>` beginning at L33:C16. Expected `<div>` to be at an indentation of 14 but was found at 16.  block-indentation\n  42:16  error  Incorrect indentation for `<div>` beginning at L42:C16. Expected `<div>` to be at an indentation of 14 but was found at 16.  block-indentation\n  11:20  error  Incorrect indentation for `<div>` beginning at L11:C20. Expected `<div>` to be at an indentation of 18 but was found at 20.  block-indentation\n  12:20  error  Incorrect indentation for `{{input}}` beginning at L12:C20. Expected `{{input}}` to be at an indentation of 18 but was found at 20.  block-indentation\n  15:20  error  Incorrect indentation for `<div>` beginning at L15:C20. Expected `<div>` to be at an indentation of 18 but was found at 20.  block-indentation\n  16:20  error  Incorrect indentation for `{{! {{input list=\'strategies-list\' id=\'strategies-input\' class=\'edit-panel--input\' key-up=(action \'formInput\' \'strategies\')}} }}` beginning at L16:C20. Expected `{{! {{input list=\'strategies-list\' id=\'strategies-input\' class=\'edit-panel--input\' key-up=(action \'formInput\' \'strategies\')}} }}` to be at an indentation of 18 but was found at 20.  block-indentation\n  17:20  error  Incorrect indentation for `<select>` beginning at L17:C20. Expected `<select>` to be at an indentation of 18 but was found at 20.  block-indentation\n  18:20  error  Incorrect indentation for `{{#each}}` beginning at L18:C20. Expected `{{#each}}` to be at an indentation of 22 but was found at 20.  block-indentation\n  19:24  error  Incorrect indentation for `<option>` beginning at L19:C24. Expected `<option>` to be at an indentation of 22 but was found at 24.  block-indentation\n  24:20  error  Incorrect indentation for `<div>` beginning at L24:C20. Expected `<div>` to be at an indentation of 18 but was found at 20.  block-indentation\n  25:20  error  Incorrect indentation for `<select>` beginning at L25:C20. Expected `<select>` to be at an indentation of 18 but was found at 20.  block-indentation\n  26:24  error  Incorrect indentation for `<option>` beginning at L26:C24. Expected `<option>` to be at an indentation of 22 but was found at 24.  block-indentation\n  27:24  error  Incorrect indentation for `{{#each}}` beginning at L27:C24. Expected `{{#each}}` to be at an indentation of 22 but was found at 24.  block-indentation\n  28:24  error  Incorrect indentation for `<option>` beginning at L28:C24. Expected `<option>` to be at an indentation of 26 but was found at 24.  block-indentation\n  28:116  error  Incorrect indentation for `{{counter.name}}` beginning at L28:C116. Expected `{{counter.name}}` to be at an indentation of 26 but was found at 116.  block-indentation\n  34:20  error  Incorrect indentation for `<div>` beginning at L34:C20. Expected `<div>` to be at an indentation of 18 but was found at 20.  block-indentation\n  35:20  error  Incorrect indentation for `<select>` beginning at L35:C20. Expected `<select>` to be at an indentation of 18 but was found at 20.  block-indentation\n  40:20  error  Incorrect indentation for `{{! trade related operations here }}` beginning at L40:C20. Expected `{{! trade related operations here }}` to be at an indentation of 18 but was found at 20.  block-indentation\n  36:20  error  Incorrect indentation for `{{#each}}` beginning at L36:C20. Expected `{{#each}}` to be at an indentation of 22 but was found at 20.  block-indentation\n  37:24  error  Incorrect indentation for `<option>` beginning at L37:C24. Expected `<option>` to be at an indentation of 22 but was found at 24.  block-indentation\n  43:20  error  Incorrect indentation for `<div>` beginning at L43:C20. Expected `<div>` to be at an indentation of 18 but was found at 20.  block-indentation\n  44:20  error  Incorrect indentation for `{{input}}` beginning at L44:C20. Expected `{{input}}` to be at an indentation of 18 but was found at 20.  block-indentation\n  45:20  error  Incorrect indentation for `<div>` beginning at L45:C20. Expected `<div>` to be at an indentation of 18 but was found at 20.  block-indentation\n  53:20  error  Incorrect indentation for `{{! <datalist class=\'edit-panel--input\' id=\'stocks-list\'>\r\n                    {{#each stocks as |stock|}}\r\n                        <option value={{stock.name}} onclick={{action \'selectHash\' \'stock\' stock}} selected={{if (eq stock.name editModel.stock.name) \'selected\'}}>{{stock.name}}</option>\r\n                    {{/each}}\r\n                    </datalist> }}` beginning at L53:C20. Expected `{{! <datalist class=\'edit-panel--input\' id=\'stocks-list\'>\r\n                    {{#each stocks as |stock|}}\r\n                        <option value={{stock.name}} onclick={{action \'selectHash\' \'stock\' stock}} selected={{if (eq stock.name editModel.stock.name) \'selected\'}}>{{stock.name}}</option>\r\n                    {{/each}}\r\n                    </datalist> }}` to be at an indentation of 18 but was found at 20.  block-indentation\n  58:20  error  Incorrect indentation for `{{! stock related operations here }}` beginning at L58:C20. Expected `{{! stock related operations here }}` to be at an indentation of 18 but was found at 20.  block-indentation\n  46:24  error  Incorrect indentation for `{{input}}` beginning at L46:C24. Expected `{{input}}` to be at an indentation of 22 but was found at 24.  block-indentation\n  47:24  error  Incorrect indentation for `<div>` beginning at L47:C24. Expected `<div>` to be at an indentation of 22 but was found at 24.  block-indentation\n  48:28  error  Incorrect indentation for `{{#each}}` beginning at L48:C28. Expected `{{#each}}` to be at an indentation of 26 but was found at 28.  block-indentation\n  49:32  error  Incorrect indentation for `<p>` beginning at L49:C32. Expected `<p>` to be at an indentation of 30 but was found at 32.  block-indentation\n  64:8  error  Incorrect indentation for `+ New Entry\n    ` beginning at L64:C8. Expected `+ New Entry\n    ` to be at an indentation of 6 but was found at 8.  block-indentation\n  49:35  error  Interaction added to non-interactive element  no-invalid-interactive\n  1:11  error  you must use double quotes in templates  quotes\n  3:71  error  you must use double quotes in templates  quotes\n  6:19  error  you must use double quotes in templates  quotes\n  7:26  error  you must use double quotes in templates  quotes\n  7:55  error  you must use double quotes in templates  quotes\n  8:21  error  you must use double quotes in templates  quotes\n  9:23  error  you must use double quotes in templates  quotes\n  10:27  error  you must use double quotes in templates  quotes\n  11:31  error  you must use double quotes in templates  quotes\n  12:55  error  you must use double quotes in templates  quotes\n  14:27  error  you must use double quotes in templates  quotes\n  15:31  error  you must use double quotes in templates  quotes\n  17:34  error  you must use double quotes in templates  quotes\n  17:57  error  you must use double quotes in templates  quotes\n  17:91  error  you must use double quotes in templates  quotes\n  17:112  error  you must use double quotes in templates  quotes\n  17:123  error  you must use double quotes in templates  quotes\n  19:105  error  you must use double quotes in templates  quotes\n  23:27  error  you must use double quotes in templates  quotes\n  24:31  error  you must use double quotes in templates  quotes\n  25:34  error  you must use double quotes in templates  quotes\n  25:57  error  you must use double quotes in templates  quotes\n  25:90  error  you must use double quotes in templates  quotes\n  25:111  error  you must use double quotes in templates  quotes\n  25:121  error  you must use double quotes in templates  quotes\n  28:103  error  you must use double quotes in templates  quotes\n  33:27  error  you must use double quotes in templates  quotes\n  34:31  error  you must use double quotes in templates  quotes\n  35:34  error  you must use double quotes in templates  quotes\n  35:57  error  you must use double quotes in templates  quotes\n  35:88  error  you must use double quotes in templates  quotes\n  35:109  error  you must use double quotes in templates  quotes\n  35:117  error  you must use double quotes in templates  quotes\n  37:99  error  you must use double quotes in templates  quotes\n  42:27  error  you must use double quotes in templates  quotes\n  43:31  error  you must use double quotes in templates  quotes\n  44:34  error  you must use double quotes in templates  quotes\n  44:69  error  you must use double quotes in templates  quotes\n  44:81  error  you must use double quotes in templates  quotes\n  44:127  error  you must use double quotes in templates  quotes\n  45:31  error  you must use double quotes in templates  quotes\n  46:37  error  you must use double quotes in templates  quotes\n  46:53  error  you must use double quotes in templates  quotes\n  46:73  error  you must use double quotes in templates  quotes\n  46:116  error  you must use double quotes in templates  quotes\n  46:128  error  you must use double quotes in templates  quotes\n  47:35  error  you must use double quotes in templates  quotes\n  49:52  error  you must use double quotes in templates  quotes\n  49:65  error  you must use double quotes in templates  quotes\n  63:18  error  you must use double quotes in templates  quotes\n  63:46  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/operand.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/operand.hbs should pass TemplateLint.\n\nclient/templates/components/operand.hbs\n  1:13  error  you must use double quotes in templates  quotes\n  2:13  error  you must use double quotes in templates  quotes\n  3:25  error  you must use double quotes in templates  quotes\n  4:25  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/operation.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/operation.hbs should pass TemplateLint.\n\nclient/templates/components/operation.hbs\n  2:4  error  Incorrect indentation for `{{component}}` beginning at L2:C4. Expected `{{component}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  5:4  error  Incorrect indentation for `{{operator}}` beginning at L5:C4. Expected `{{operator}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  8:4  error  Incorrect indentation for `{{component}}` beginning at L8:C4. Expected `{{component}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  2:54  error  you must use double quotes in templates  quotes\n  2:62  error  you must use double quotes in templates  quotes\n  2:82  error  you must use double quotes in templates  quotes\n  2:88  error  you must use double quotes in templates  quotes\n  2:112  error  you must use double quotes in templates  quotes\n  2:122  error  you must use double quotes in templates  quotes\n  8:56  error  you must use double quotes in templates  quotes\n  8:64  error  you must use double quotes in templates  quotes\n  8:85  error  you must use double quotes in templates  quotes\n  8:91  error  you must use double quotes in templates  quotes\n  8:116  error  you must use double quotes in templates  quotes\n  8:126  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/operator.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/operator.hbs should pass TemplateLint.\n\nclient/templates/components/operator.hbs\n  3:4  error  Incorrect indentation for `{{log}}` beginning at L3:C4. Expected `{{log}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  4:4  error  Incorrect indentation for `{{#each}}` beginning at L4:C4. Expected `{{#each}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  5:8  error  Incorrect indentation for `<option>` beginning at L5:C8. Expected `<option>` to be at an indentation of 6 but was found at 8.  block-indentation\n  3:4  error  Unexpected {{log}} usage.  no-log\n  2:26  error  you must use double quotes in templates  quotes\n  2:44  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/property-component.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/property-component.hbs should pass TemplateLint.\n\nclient/templates/components/property-component.hbs\n  1:13  error  you must use double quotes in templates  quotes\n  2:9  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/strategy-component.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/strategy-component.hbs should pass TemplateLint.\n\nclient/templates/components/strategy-component.hbs\n  2:4  error  Incorrect indentation for `<div>` beginning at L2:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  3:4  error  Incorrect indentation for `{{input}}` beginning at L3:C4. Expected `{{input}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  5:4  error  Incorrect indentation for `<button>` beginning at L5:C4. Expected `<button>` to be at an indentation of 2 but was found at 4.  block-indentation\n  8:4  error  Incorrect indentation for `<div>` beginning at L8:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  9:4  error  Incorrect indentation for `{{#if}}` beginning at L9:C4. Expected `{{#if}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  10:8  error  Incorrect indentation for `{{operation}}` beginning at L10:C8. Expected `{{operation}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  14:4  error  Incorrect indentation for `<div>` beginning at L14:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  15:4  error  Incorrect indentation for `{{#if}}` beginning at L15:C4. Expected `{{#if}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  16:8  error  Incorrect indentation for `{{operation}}` beginning at L16:C8. Expected `{{operation}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  20:4  error  Incorrect indentation for `<div>` beginning at L20:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  21:4  error  Incorrect indentation for `{{#if}}` beginning at L21:C4. Expected `{{#if}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  22:8  error  Incorrect indentation for `{{operation}}` beginning at L22:C8. Expected `{{operation}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  1:11  error  you must use double quotes in templates  quotes\n  3:17  error  you must use double quotes in templates  quotes\n  5:21  error  you must use double quotes in templates  quotes\n  7:11  error  you must use double quotes in templates  quotes\n  10:60  error  you must use double quotes in templates  quotes\n  13:11  error  you must use double quotes in templates  quotes\n  16:58  error  you must use double quotes in templates  quotes\n  19:11  error  you must use double quotes in templates  quotes\n  22:56  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/strategy-wrapper.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/strategy-wrapper.hbs should pass TemplateLint.\n\nclient/templates/components/strategy-wrapper.hbs\n  2:4  error  Incorrect indentation for `<div>` beginning at L2:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  5:4  error  Incorrect indentation for `<div>` beginning at L5:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  3:8  error  Incorrect indentation for `Strategy\n    ` beginning at L3:C8. Expected `Strategy\n    ` to be at an indentation of 6 but was found at 8.  block-indentation\n  6:8  error  Incorrect indentation for `<div>` beginning at L6:C8. Expected `<div>` to be at an indentation of 6 but was found at 8.  block-indentation\n  21:8  error  Incorrect indentation for `<div>` beginning at L21:C8. Expected `<div>` to be at an indentation of 6 but was found at 8.  block-indentation\n  7:12  error  Incorrect indentation for `<div>` beginning at L7:C12. Expected `<div>` to be at an indentation of 10 but was found at 12.  block-indentation\n  10:12  error  Incorrect indentation for `<ul>` beginning at L10:C12. Expected `<ul>` to be at an indentation of 10 but was found at 12.  block-indentation\n  8:16  error  Incorrect indentation for `<span>` beginning at L8:C16. Expected `<span>` to be at an indentation of 14 but was found at 16.  block-indentation\n  11:16  error  Incorrect indentation for `{{#each}}` beginning at L11:C16. Expected `{{#each}}` to be at an indentation of 14 but was found at 16.  block-indentation\n  12:20  error  Incorrect indentation for `{{#if}}` beginning at L12:C20. Expected `{{#if}}` to be at an indentation of 18 but was found at 20.  block-indentation\n  13:24  error  Incorrect indentation for `<li>` beginning at L13:C24. Expected `<li>` to be at an indentation of 22 but was found at 24.  block-indentation\n  14:28  error  Incorrect indentation for `<div>` beginning at L14:C28. Expected `<div>` to be at an indentation of 26 but was found at 28.  block-indentation\n  15:28  error  Incorrect indentation for `<button>` beginning at L15:C28. Expected `<button>` to be at an indentation of 26 but was found at 28.  block-indentation\n  22:12  error  Incorrect indentation for `<div>` beginning at L22:C12. Expected `<div>` to be at an indentation of 10 but was found at 12.  block-indentation\n  29:12  error  Incorrect indentation for `{{#if}}` beginning at L29:C12. Expected `{{#if}}` to be at an indentation of 10 but was found at 12.  block-indentation\n  23:16  error  Incorrect indentation for `{{#if}}` beginning at L23:C16. Expected `{{#if}}` to be at an indentation of 14 but was found at 16.  block-indentation\n  24:20  error  Incorrect indentation for `{{strategy-component}}` beginning at L24:C20. Expected `{{strategy-component}}` to be at an indentation of 18 but was found at 20.  block-indentation\n  26:20  error  Incorrect indentation for `Nothing\n                ` beginning at L26:C20. Expected `Nothing\n                ` to be at an indentation of 18 but was found at 20.  block-indentation\n  30:16  error  Incorrect indentation for `<div>` beginning at L30:C16. Expected `<div>` to be at an indentation of 14 but was found at 16.  block-indentation\n  31:20  error  Incorrect indentation for `<button>` beginning at L31:C20. Expected `<button>` to be at an indentation of 18 but was found at 20.  block-indentation\n  32:20  error  Incorrect indentation for `<button>` beginning at L32:C20. Expected `<button>` to be at an indentation of 18 but was found at 20.  block-indentation\n  22:17  error  elements cannot have inline styles  no-inline-styles\n  30:21  error  elements cannot have inline styles  no-inline-styles\n  8:22  error  Interaction added to non-interactive element  no-invalid-interactive\n  13:96  error  Interaction added to non-interactive element  no-invalid-interactive\n  8:39  error  you must use double quotes in templates  quotes\n  13:34  error  you must use double quotes in templates  quotes\n  13:113  error  you must use double quotes in templates  quotes\n  14:39  error  you must use double quotes in templates  quotes\n  15:53  error  you must use double quotes in templates  quotes\n  22:23  error  you must use double quotes in templates  quotes\n  30:27  error  you must use double quotes in templates  quotes\n  31:45  error  you must use double quotes in templates  quotes\n  32:45  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/tab-component.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/tab-component.hbs should pass TemplateLint.\n\nclient/templates/components/tab-component.hbs\n  3:4  error  Incorrect indentation for `<div>` beginning at L3:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  10:4  error  Incorrect indentation for `<div>` beginning at L10:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  4:8  error  Incorrect indentation for `{{#each}}` beginning at L4:C8. Expected `{{#each}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  5:12  error  Incorrect indentation for `<div>` beginning at L5:C12. Expected `<div>` to be at an indentation of 10 but was found at 12.  block-indentation\n  6:16  error  Incorrect indentation for `{{#link-to}}` beginning at L6:C16. Expected `{{#link-to}}` to be at an indentation of 14 but was found at 16.  block-indentation\n  2:11  error  you must use double quotes in templates  quotes\n  3:15  error  you must use double quotes in templates  quotes\n  5:23  error  you must use double quotes in templates  quotes\n  10:15  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/trade-component.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/trade-component.hbs should pass TemplateLint.\n\nclient/templates/components/trade-component.hbs\n  2:4  error  Incorrect indentation for `<div>` beginning at L2:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  3:4  error  Incorrect indentation for `{{input}}` beginning at L3:C4. Expected `{{input}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  6:4  error  Incorrect indentation for `<div>` beginning at L6:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  7:4  error  Incorrect indentation for `{{#if}}` beginning at L7:C4. Expected `{{#if}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  12:4  error  Incorrect indentation for `<button>` beginning at L12:C4. Expected `<button>` to be at an indentation of 2 but was found at 4.  block-indentation\n  8:8  error  Incorrect indentation for `{{component}}` beginning at L8:C8. Expected `{{component}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  10:8  error  Incorrect indentation for `{{input}}` beginning at L10:C8. Expected `{{input}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  15:4  error  Incorrect indentation for `<div>` beginning at L15:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  16:4  error  Incorrect indentation for `{{#if}}` beginning at L16:C4. Expected `{{#if}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  21:4  error  Incorrect indentation for `<button>` beginning at L21:C4. Expected `<button>` to be at an indentation of 2 but was found at 4.  block-indentation\n  17:8  error  Incorrect indentation for `{{component}}` beginning at L17:C8. Expected `{{component}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  19:8  error  Incorrect indentation for `{{input}}` beginning at L19:C8. Expected `{{input}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  24:4  error  Incorrect indentation for `<div>` beginning at L24:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  25:4  error  Incorrect indentation for `{{#if}}` beginning at L25:C4. Expected `{{#if}}` to be at an indentation of 2 but was found at 4.  block-indentation\n  30:4  error  Incorrect indentation for `<button>` beginning at L30:C4. Expected `<button>` to be at an indentation of 2 but was found at 4.  block-indentation\n  26:8  error  Incorrect indentation for `{{component}}` beginning at L26:C8. Expected `{{component}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  28:8  error  Incorrect indentation for `{{input}}` beginning at L28:C8. Expected `{{input}}` to be at an indentation of 6 but was found at 8.  block-indentation\n  1:11  error  you must use double quotes in templates  quotes\n  3:17  error  you must use double quotes in templates  quotes\n  5:11  error  you must use double quotes in templates  quotes\n  8:59  error  you must use double quotes in templates  quotes\n  8:65  error  you must use double quotes in templates  quotes\n  10:21  error  you must use double quotes in templates  quotes\n  12:21  error  you must use double quotes in templates  quotes\n  12:35  error  you must use double quotes in templates  quotes\n  14:11  error  you must use double quotes in templates  quotes\n  17:61  error  you must use double quotes in templates  quotes\n  17:67  error  you must use double quotes in templates  quotes\n  19:21  error  you must use double quotes in templates  quotes\n  21:21  error  you must use double quotes in templates  quotes\n  21:35  error  you must use double quotes in templates  quotes\n  23:11  error  you must use double quotes in templates  quotes\n  26:65  error  you must use double quotes in templates  quotes\n  26:71  error  you must use double quotes in templates  quotes\n  28:21  error  you must use double quotes in templates  quotes\n  30:21  error  you must use double quotes in templates  quotes\n  30:35  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/components/trade-wrapper.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/components/trade-wrapper.hbs should pass TemplateLint.\n\nclient/templates/components/trade-wrapper.hbs\n  2:4  error  Incorrect indentation for `<div>` beginning at L2:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  5:4  error  Incorrect indentation for `<div>` beginning at L5:C4. Expected `<div>` to be at an indentation of 2 but was found at 4.  block-indentation\n  3:8  error  Incorrect indentation for `Trade\n    ` beginning at L3:C8. Expected `Trade\n    ` to be at an indentation of 6 but was found at 8.  block-indentation\n  6:8  error  Incorrect indentation for `<div>` beginning at L6:C8. Expected `<div>` to be at an indentation of 6 but was found at 8.  block-indentation\n  22:8  error  Incorrect indentation for `<div>` beginning at L22:C8. Expected `<div>` to be at an indentation of 6 but was found at 8.  block-indentation\n  7:12  error  Incorrect indentation for `<div>` beginning at L7:C12. Expected `<div>` to be at an indentation of 10 but was found at 12.  block-indentation\n  10:12  error  Incorrect indentation for `<ul>` beginning at L10:C12. Expected `<ul>` to be at an indentation of 10 but was found at 12.  block-indentation\n  8:16  error  Incorrect indentation for `<span>` beginning at L8:C16. Expected `<span>` to be at an indentation of 14 but was found at 16.  block-indentation\n  11:16  error  Incorrect indentation for `{{#each}}` beginning at L11:C16. Expected `{{#each}}` to be at an indentation of 14 but was found at 16.  block-indentation\n  12:20  error  Incorrect indentation for `{{#if}}` beginning at L12:C20. Expected `{{#if}}` to be at an indentation of 18 but was found at 20.  block-indentation\n  13:20  error  Incorrect indentation for `<li>` beginning at L13:C20. Expected `<li>` to be at an indentation of 22 but was found at 20.  block-indentation\n  15:24  error  Incorrect indentation for `<div>` beginning at L15:C24. Expected `<div>` to be at an indentation of 22 but was found at 24.  block-indentation\n  16:24  error  Incorrect indentation for `<button>` beginning at L16:C24. Expected `<button>` to be at an indentation of 22 but was found at 24.  block-indentation\n  23:12  error  Incorrect indentation for `<div>` beginning at L23:C12. Expected `<div>` to be at an indentation of 10 but was found at 12.  block-indentation\n  30:12  error  Incorrect indentation for `{{#if}}` beginning at L30:C12. Expected `{{#if}}` to be at an indentation of 10 but was found at 12.  block-indentation\n  24:16  error  Incorrect indentation for `{{#if}}` beginning at L24:C16. Expected `{{#if}}` to be at an indentation of 14 but was found at 16.  block-indentation\n  25:20  error  Incorrect indentation for `{{trade-component}}` beginning at L25:C20. Expected `{{trade-component}}` to be at an indentation of 18 but was found at 20.  block-indentation\n  27:20  error  Incorrect indentation for `Nothing\n                ` beginning at L27:C20. Expected `Nothing\n                ` to be at an indentation of 18 but was found at 20.  block-indentation\n  31:16  error  Incorrect indentation for `<div>` beginning at L31:C16. Expected `<div>` to be at an indentation of 14 but was found at 16.  block-indentation\n  32:20  error  Incorrect indentation for `<button>` beginning at L32:C20. Expected `<button>` to be at an indentation of 18 but was found at 20.  block-indentation\n  33:20  error  Incorrect indentation for `<button>` beginning at L33:C20. Expected `<button>` to be at an indentation of 18 but was found at 20.  block-indentation\n  23:17  error  elements cannot have inline styles  no-inline-styles\n  31:21  error  elements cannot have inline styles  no-inline-styles\n  8:22  error  Interaction added to non-interactive element  no-invalid-interactive\n  14:24  error  Interaction added to non-interactive element  no-invalid-interactive\n  8:39  error  you must use double quotes in templates  quotes\n  13:30  error  you must use double quotes in templates  quotes\n  14:41  error  you must use double quotes in templates  quotes\n  15:35  error  you must use double quotes in templates  quotes\n  16:49  error  you must use double quotes in templates  quotes\n  23:23  error  you must use double quotes in templates  quotes\n  31:27  error  you must use double quotes in templates  quotes\n  32:45  error  you must use double quotes in templates  quotes\n  33:45  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('client/templates/dashboard.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'client/templates/dashboard.hbs should pass TemplateLint.\n\nclient/templates/dashboard.hbs\n  2:4  error  Incorrect indentation for `{{outlet}}` beginning at L2:C4. Expected `{{outlet}}` to be at an indentation of 2 but was found at 4.  block-indentation\n');
  });
  QUnit.test('client/templates/dashboard/backtest.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'client/templates/dashboard/backtest.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('client/templates/dashboard/entry.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'client/templates/dashboard/entry.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('client/templates/dashboard/strategy.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'client/templates/dashboard/strategy.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('client/templates/dashboard/trade.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'client/templates/dashboard/trade.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('client/templates/strategy/create.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'client/templates/strategy/create.hbs should pass TemplateLint.\n\n');
  });
});
define("client/tests/lint/tests.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | tests');
  QUnit.test('integration/components/entry-record-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/entry-record-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/entry-row-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/entry-row-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/entry-wrapper-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/entry-wrapper-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/operand-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/operand-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/operation-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/operation-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/operator-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/operator-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/property-component-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/property-component-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/strategy-component-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/strategy-component-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/strategy-wrapper-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/strategy-wrapper-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/tab-component-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tab-component-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/trade-component-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/trade-component-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/trade-wrapper-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/trade-wrapper-test.js should pass ESLint\n\n');
  });
  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });
  QUnit.test('unit/adapters/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/application-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/models/entry-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/entry-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/models/operand-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/operand-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/models/operation-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/operation-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/models/stock-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/stock-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/models/strategy-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/strategy-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/models/trade-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/trade-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/application-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/dashboard/backtest-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/dashboard/backtest-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/index-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/index-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/index/entry-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/index/entry-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/index/strategy-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/index/strategy-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/index/trade-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/index/trade-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/strategy/create-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/strategy/create-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/serializers/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/application-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/serializers/strategy-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/strategy-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/serializers/trade-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/trade-test.js should pass ESLint\n\n');
  });
});
define("client/tests/test-helper", ["client/app", "client/config/environment", "@ember/test-helpers", "ember-qunit"], function (_app, _environment, _testHelpers, _emberQunit) {
  "use strict";

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));
  (0, _emberQunit.start)();
});
define("client/tests/unit/adapters/application-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Adapter | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let adapter = this.owner.lookup('adapter:application');
      assert.ok(adapter);
    });
  });
});
define("client/tests/unit/models/entry-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Model | entry', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('entry', {});
      assert.ok(model);
    });
  });
});
define("client/tests/unit/models/operand-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Model | operand', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('operand', {});
      assert.ok(model);
    });
  });
});
define("client/tests/unit/models/operation-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Model | operation', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('operation', {});
      assert.ok(model);
    });
  });
});
define("client/tests/unit/models/stock-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Model | stock', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('stock', {});
      assert.ok(model);
    });
  });
});
define("client/tests/unit/models/strategy-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Model | strategy', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('strategy', {});
      assert.ok(model);
    });
  });
});
define("client/tests/unit/models/trade-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Model | trade', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('trade', {});
      assert.ok(model);
    });
  });
});
define("client/tests/unit/routes/application-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:application');
      assert.ok(route);
    });
  });
});
define("client/tests/unit/routes/dashboard/backtest-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | dashboard/backtest', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:dashboard/backtest');
      assert.ok(route);
    });
  });
});
define("client/tests/unit/routes/index-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | index', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:index');
      assert.ok(route);
    });
  });
});
define("client/tests/unit/routes/index/entry-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | index/entry', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:index/entry');
      assert.ok(route);
    });
  });
});
define("client/tests/unit/routes/index/strategy-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | index/strategy', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:index/strategy');
      assert.ok(route);
    });
  });
});
define("client/tests/unit/routes/index/trade-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | index/trade', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:index/trade');
      assert.ok(route);
    });
  });
});
define("client/tests/unit/routes/strategy/create-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | strategy/create', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:strategy/create');
      assert.ok(route);
    });
  });
});
define("client/tests/unit/serializers/application-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Serializer | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let serializer = store.serializerFor('application');
      assert.ok(serializer);
    });
    (0, _qunit.test)('it serializes records', function (assert) {
      let store = this.owner.lookup('service:store');
      let record = store.createRecord('application', {});
      let serializedRecord = record.serialize();
      assert.ok(serializedRecord);
    });
  });
});
define("client/tests/unit/serializers/strategy-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Serializer | strategy', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let serializer = store.serializerFor('strategy');
      assert.ok(serializer);
    });
    (0, _qunit.test)('it serializes records', function (assert) {
      let store = this.owner.lookup('service:store');
      let record = store.createRecord('strategy', {});
      let serializedRecord = record.serialize();
      assert.ok(serializedRecord);
    });
  });
});
define("client/tests/unit/serializers/trade-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Serializer | trade', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let serializer = store.serializerFor('trade');
      assert.ok(serializer);
    });
    (0, _qunit.test)('it serializes records', function (assert) {
      let store = this.owner.lookup('service:store');
      let record = store.createRecord('trade', {});
      let serializedRecord = record.serialize();
      assert.ok(serializedRecord);
    });
  });
});
define('client/config/environment', [], function() {
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

require('client/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
