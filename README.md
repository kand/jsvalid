<h1>jsValid</h1>
Simple Javascript validation framework built off jQuery.

Define a list of validations to run then call validate(validations):
<pre><code>var validations = [ ... ];
var results = jsvalid.validate(validations);</pre></code>

<h2>Input</h2>
Each validation within the list is an object following this pattern:
<pre><code>{
	<b>select</b>: jQuery selector to use for this validation. (string),
	<b>validate</b>: either a string representing an api defined validation or a custom validation
		function to run on each selected element. Should return true if the field is valid, false otherwise. (string or func),
	<b>args</b>: a list of arguments that is passed into the validation function. (string) (optional),
	<b>signature</b>: signature to assign this validation, allows you to keep track of what validators
		have been run. If not defined, will default to either 'undefined' if using your
		own validation function, or to the name of the api function run. (string) (optional),
	<b>validMessage</b>: message to give user when validation succeeds. (string) (optional),
	<b>invalidMessage</b>: message to give user when validation fails. (string) (optional)
}</code></pre>

<h3>Input Notes</h3>
The <b>validate</b> function is run individually on each input selected. This function takes in 3 arguments:
<pre><code><b>results</b> = results list from validations that have already been run
<b>$element</b> = current element to be validated
<b>args</b> = a list of arguments defined in the args parameter of the validation</code></pre>

The <b>signature</b> value can be used to later identify what validations have been run. Keep this value associated
	to validated field somewhere--on the validation message within html or in javascript perhaps--to be
	used later.

The <b>validMessage</b> and <b>invalidMessage</b> values can contain variables in the form of {i} where i is an
	integer. {0} defaults to the html contents of the label assigned to the input. Any other values for i
	will correspond to the arguments given to the validation function.

<h2>Output</h2>
The result of validations follow this pattern:
<pre><code>var validations = [ ... ];
var results = jsvalid.validate(validations);

results === [{
	<b>message</b>: validation message that goes along with validation result (string),
	<b>name</b>: name of validated field which is the html contained in a field's label (string),
	<b>selector</b>: selector that can be used to find the validated field (string),
	<b>signature</b>: signature of the validated function that was run (string),
	<b>valid</b>: boolean representing if the field valid is valid or not (boolean)
}, ... ]</pre></code>

<h2>API Defined Validations</h2>
<pre><code><b>required</b> = returns true if input has a value, false otherwise
<b>lengthRange(x,y)</b> = returns true if input value has length L where x &lt; L &lt; y, false otherwise
<b>pattern(p)</b> = returns true if input matches given pattern p, false otherwise, p follows this syntax:
	@ = any character A-Z or a-z
	# = any number 0-9
	? = any character
	any other characters will be validated as that character at that position</code></pre>

<h2>TODO</h2>
- Add method to automatically apply validation to form elements that have special attributes or classes
- Allow validMessage/invalidMessage to get arguments in the form of {keyName} instead of just integers so that arbirary maps can be used to format messages
- Add license
- Squash commits if possible
- Allow args into validation functions to be objects intead of just lists
- Allow select argument to be a jQuery object, not just a string
