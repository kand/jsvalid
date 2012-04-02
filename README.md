<h1>jsValid</h1>
Simple Javascript validation framework built off jQuery.

Define a list of validations to run then call validate(validations).

Each validation within the list is an object following this pattern:
<pre><code>&#123;
	<b>select</b>: jQuery selector to use for this validation. (string),
	<b>validate</b>: either a string representing an api defined validation or a custom validation
		function to run on each selected element. (string or func),
	<b>signature</b>: signature to assign this validation, allows you to keep track of what validators
		have been run. If not defined, will default to either 'undefined' if using your
		own validation function, or to the name of the api function run. (string) (optional),
	<b>validMessage</b>: message to give user when validation succeeds. (string),
	<b>invalidMessage</b>: message to give user when validation fails. (string)
&#125;</code></pre>

The validate function is run individually on each input selected. This function takes in 2 arguments:
<pre><code>results = results list from validations that have already been run
$element = current element to be validated</code></pre>

The signature value can be used to later identify what validations have been run. Keep this value associated
	to validated field somewhere--on the validation message within html or in javascript perhaps--to be
	used later.

The valid/invalid message values can contain variables in the form of {i} where i is an integer. {0} defaults
to the html contents of the label assigned to the input. Any other values for i will correspond to the arguments
given to the validation function.

<h2>API Defined Validations</h2>
<pre><code>required = returns true if input has a value, false otherwise
lengthRange(x,y) = returns true if input value has length L where x &lt; L &gt; y, false otherwise
pattern(p) = returns true if input matches given pattern p, false otherwise, p follows this syntax:
	@ = any character A-Z or a-z
	# = any number 0-9
	? = any character
	any other characters will be validated as that character at that position</code></pre>

<h2>TODO</h2>
- Custom user functions need ability to pass arguments to valid/invalid message
- Arguments to validate string need ability to contain commas
