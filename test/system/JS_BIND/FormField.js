var testCase = TestCase("system.JS_BIND.FormField");

testCase.prototype.setUp = function(){
    /*:DOC += <form>
                  <input id="textBox" type="text" />
                  <textarea id="textarea"></textarea>
                  <input id="checkbox" type="checkbox" />
              </form>*/
}

testCase.prototype.testText_ValueTypeIsFormField_ShouldChangeValue = function(){
    js.bind("foo").to("#textBox", { valueType: "inputValue" });
    assertEquals("Bound value", "foo", $("#textBox").val());
};

testCase.prototype.testTextarea_ValueTypeIsFormField_ShouldChangeValue = function(){
    js.bind("foo").to("#textarea", { valueType: "inputValue" });
    assertEquals("Bound value", "foo", $("#textarea").val());
};

testCase.prototype.testCheckbox_ValueTypeIsFormField_ShouldChangeValue = function(){
    var foo = js.bindableValue();

    js.bind(foo).to("#checkbox", { valueType: "checkedAttribute" });

    foo.setValue(true);
    console.log($("#checkbox").parent().html());
    assertTrue("Checkbox is checked", $("#checkbox").is(':checked'));

    foo.setValue(false);
    assertFalse("Checkbox is checked", $("#checkbox").is(':checked'));
};
