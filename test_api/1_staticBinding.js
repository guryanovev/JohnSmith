var testCase = new TestCase("Static Binding");

testCase.prototype.testShouldRenderValue = function(){
    $("body").append("<div id='testStaticBinding'><span class='value'></span></div>");

    js.bind("foo").to("#testStaticBinding .value");

    assertEquals("Bound value result", "foo", $("#testStaticBinding .value").text());
}