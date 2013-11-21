var testCase = TestCase("unit.binding.DefaultBindingManager");

testCase.prototype.testShouldCreateWireIfFactoriesProvided = function() {
    var bindable = {};
    var handler = {};

    var bindableFactories = [];
    bindableFactories.push({
        createBindable: function(data){
            return bindable;
        }
    });

    var handlerFactories = [];
    handlerFactories.push({
        createHandler: function(data){
            return handler;
        }
    });

    var manager = new JohnSmith.Binding.DefaultBindingManager(bindableFactories, handlerFactories);

    var wire = manager.bind({
        bindableData: {foo: "bar"},
        handlerData: {foo: 42}
    });

    assertNotNull("Created wire", wire);
    assertEquals("Wire bindable", bindable, wire.getBindable());
    assertEquals("Wire handler", handler, wire.getHandler());
};

testCase.prototype.testNoHandlerFactoryShouldThrowError = function() {
    var bindable = {};
    var handler = {};

    var bindableFactories = [];
    bindableFactories.push({
        createBindable: function(data){
            return bindable;
        }
    });

    var handlerFactories = [];
    var manager = new JohnSmith.Binding.DefaultBindingManager(bindableFactories, handlerFactories, []);

    assertException(
        "Try to create a wire",
        function(){
            manager.bind({
                bindableData: {foo: "bar"},
                handlerData: {foo: 42}
            });
        });
};

testCase.prototype.testNoBindableFactoryShouldThrowError = function() {
    var bindable = {};
    var handler = {};

    var bindableFactories = [];
    var handlerFactories = [];
    handlerFactories.push({
        createHandler: function(data){
            return new JohnSmith.Binding.HandlerFactoryResult(handler, null);
        }
    });

    var manager = new JohnSmith.Binding.DefaultBindingManager(bindableFactories, handlerFactories, []);

    assertException(
        "Try to create a wire",
        function(){
            manager.bind({
                bindableData: {foo: "bar"},
                handlerData: {foo: 42}
            });
        });
};
