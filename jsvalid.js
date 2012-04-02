/*
 * Library to validate form elements.
 */
var jsvalid = (function($){
	
	/**
	 * Build an input for validation framework.
	 * 
	 * Inputs from user are transformed here to input useful to api.
	 *
	 * returns an object representing a validation input. Has the following properties:
	 * 	elements = selected elements to run validations on
	 *	validate = function to use for validation on each element in selection
	 *	signature = signature of validation run
	 * 	validMessage = message to return if validate returns true
	 *	invalidMessage = message to return if validate returns false
	 */
	var _buildInput = function(select,validate,signature,validMessage,invalidMessage){
		// select elements with given selector		
		var elements = $(select);

		// if validate is a string, user is looking for api defined function, find related messages in api
		if(!validMessage && typeof(validate) === 'string' && jsvalid.messages.valid[validate]){
			validMessage = jsvalid.messages.valid[validate];
		}
		if(!invalidMessage && typeof(validate) === 'string' && jsvalid.messages.invalid[validate]){
			invalidMessage = jsvalid.messages.invalid[validate];
		}

		// if signature was not provided, user is probably using an api defined signature
		if(!signature && jsvalid[validate]){
			signature = validate;
		}

		return {
			elements: elements,
			validate: validate,
			signature: signature,
			validMessage: validMessage,
			invalidMessage: invalidMessage
		};
	};
		
	/**
	 * Builds a result from api output to be returned to the user.
	 *
	 * Inputs from api are transformed here into output useful to user.
	 *
	 * returns an object representing a validation result. Has the following properties:
	 *	name = text inside field's label 
	 *	selector = selector that can be used to find this field
	 * 	signature = signature left by validation function so user knows what validation was run 
	 * 	valid = true if field is valid, false otherwise 
	 *	message = message related to validation
	 */
	var _buildResult = function(selector,signature,valid,message,messageArgs){
		// get the name of the element from the element's label
		var eleId = $(selector).prop('id');
		var $label = $('label[for="' + eleId + '"]');
		var name = $label.html();	
		// make sure valid is a boolean value
		valid = valid ? true : false;
		// replace regex matches in messsage with field name and args
		if(message){
			var i = 0;
			message = message.replace('\{' + i + '\}', name);
			
			// check for message args	
			if(messageArgs){
				var len = messageArgs.length + 1;
				i++;
				for(i;i < len;i++){
					message = message.replace('\{' + i  + '\}', messageArgs[i - 1]);
				}	
			}
		}

		return {
			name: name,
			selector: selector,
			signature: signature,
			valid: valid,
			message: message
		};
	};

	/**
	 * Parse the arguments out of a given validate string. The string should be of the format:
	 *	apiValidationName(arg1,arg2,arg3)
	 *
	 * returns an object with the following format:
	 *	name = name of the function to run
	 * 	args = a list of arguments to use when running the function
	 */
	var _parseArgs = function(inputStr){
		var funcName = inputStr;
		var args = [];
		// find open and close paretheses
		var op = inputStr.search(/\(/);
		var cp = inputStr.search(/\)/);
		if(op > -1 && cp > -1){
			funcName = inputStr.substring(0,op);
			// found both paretheses, parse substring
			var strArgs = inputStr.substring(op + 1,cp);
			args = strArgs.split(',');
		}

		return {
			name: funcName,
			args: args
		};
	};

	/**
	 * Validate a field for a value. Strings containing only spaces are invalid.
	 *
	 * results = results from validations already run
	 * $element = element to run validation on
	 *
	 * returns true if has value, false otherwise
	 */
	var _validateRequired = function(results, $element, args){
		var trimmedVal = $.trim($element.val());
		if(trimmedVal.length > 0) return true;
		return false;
	};

	/**
	 * Validate a field for having a value within given range.
	 *
	 * results = results from validations already run
	 * $element = element to run validation on
	 * args = a list where the first value is the min number of characters allowed, second
	 * 	value is the max number of characters allowed
	 *
	 * returns true if length is within given range, false otherwise
	 */
	var _validateLengthRange = function(results, $element, args){
		var minLen = args[0];
		var maxLen = args[1];
		var eleLen = $element.val().length;
		if(minLen <= eleLen && eleLen <= maxLen) return true;
		return false;
	};


	// Matching dictionary for pattern matching validator
	var _match = {};
	// our special characters
	_match['@'] = '[A-Za-z]';
	_match['#'] = '\\d';
	_match['?'] = '.';
	// make sure special regex values are escaped
	_match['.'] = '\\.';
	_match['('] = '\\(';
	_match[')'] = '\\)';
	_match['{'] = '\\{';
	_match['}'] = '\\}';
	_match['['] = '\\[';
	_match[']'] = '\\]';
	_match['^'] = '\\^';
	_match['$'] = '\\$';
	_match['|'] = '\\|';
	_match['*'] = '\\*';
	_match['+'] = '\\+';

	/**
	 * Validate field based on a given pattern. Patterns follow this format:
	 * 	@ = an alpha character (get @ with \@)
	 *	# = a numeric character (get # with \#)
	 * 	? = any character (get # with \?)
	 *	any other character will validate as that character at that position
	 *
	 * results = results from validations already run
	 * $element = element to run validation on
	 * args = a list where the first value is the pattern to use for validations
	 *
	 * returns true if value matches given pattern, false otherwise
	 */
	var _validatePattern = function(results, $element, args){
		var pattern = args[0];
		var val = $element.val();

		// parse pattern and build regex
		var regex = '';
		var len = pattern.length;
		for(var i = 0;i < len;i++){
			var c = pattern[i];
			if(_match[c]) regex += _match[c];
			else regex += c;
		}

		// match pattern to value and return
		if(val.match(regex)) return true;
		return false;
	};

	/**
	 * Validate a given list of validations.
	 *
	 * validations = a list of validations to run. Each object in the list should have this format:
	 *	{
	 *	select: selector to use to find elements to apply validations to (string),
	 *	validate: a string or function specifying what validation to use (string or function),
	 *	validateArgs: a list of arguments to pass into a user defined validate function (list) (optional),
	 *	signature: a function signature to give the validation, allows you to track what validations
	 *		were run (string) (optional),
	 *	validMessage: message to give when validation succeeds (string) (optional),
	 *	invalidMessage: message to give when validation fails (string) (optional)
	 *	}
	 * 
	 * returns a list of objects in this format:
	 * 	{
	 *	message: validation message related to if the field is valid (string)
	 *	name: validated field name which is the html in a field's label (string),
	 *	selector: selector that can be used to find the validated field (string),
	 *	signature: signature of the validation funciton run (string),
	 *	valid: is the field valid (boolean),
	 *	}	
	 */
	var _validate = function(validations){
		// list of results to return
		var results = [];
		// loop through given validations
		var len = validations.length;
		for(var i = 0;i < len;i++){	
			var v = validations[i];

			// parse out validation if it is a string
			var func = {
				name: v.validate, 
				args: []
			};
			if(typeof(v.validate) === 'string'){
				func = _parseArgs(v.validate);
			} else {
				func.args = v.validateArgs;
			} 

			// get validation object
			var vinput = new _buildInput(v.select,func.name,v.signature,v.validMessage,v.invalidMessage);					
			// run validations on each element
			var jlen = vinput.elements.length;
			for(var j = 0;j < jlen;j++){
				var $ele = $(vinput.elements[j]);
				var eleId = '#' + $ele.prop('id');
				var valid = false;
				
				// is the api user trying to use an api defined function or their own custom function?
				var validator = jsvailid[func.name] ? jsvalid[func.name] : vinput.validate;
				// run validation function
				valid = validator(results, $ele, func.args);	

				// create validation object based on validation result
				var args = func ? func.args : null;
				if(valid) result = new _buildResult(eleId,vinput.signature,true,vinput.validMessage,args);
				else result = new _buildResult(eleId,vinput.signature,false,vinput.invalidMessage,args);

				// add result to results list
				results.push(result);
			}

		}

		return results;
	};

	return {
		messages: {
			valid: {
				required: '{0} has a value!',
				lengthRange: '{0} has between {1} and {2} characters!',
				pattern: '{0} is in the proper format!'
			},
			invalid: {
				required: '{0} is required!',
				lengthRange: '{0} must have between {1} and {2} characters!',
				pattern: '{0} is not in the proper format!'
			}
		},
		validate: _validate,
		required: _validateRequired,
		lengthRange: _validateLengthRange,
		pattern: _validatePattern
	};
})($);
