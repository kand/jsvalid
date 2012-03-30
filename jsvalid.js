/*
 * Library to validate form elements.
 */
var jsvalid = (function($){
	
	/**
	 * An object representing a validation input. Has the following properties:
	 * 	elements = selected elements to run validations on
	 *	validate = function to use for validation on each element in selection
	 * 	validMessage = message to return if validate returns true
	 *	invalidMessage = message to return if validate returns false
	 */
	var _buildInput = function(select,validate,validMessage,invalidMessage){
		// select elements with given selector		
		var elements = $(select);

		// if validate is a string user looking for api defined function, find related messages in api
		if(typeof(validate) === 'string' && jsvalid.messages.valid[validate]){
			validMessage = jsvalid.messages.valid[validate];
		}
		if(typeof(validate) === 'string' && jsvalid.messages.invalid[validate]){
			invalidMessage = jsvalid.messages.invalid[validate];
		}

		return {
			elements: elements,
			validate: validate,
			validMessage: validMessage,
			invalidMessage: invalidMessage
		};
	};
		
	/**
	 * An object representing a validation result. Has the following properties:
	 *	name = text inside field's label 
	 *	selector = selector that can be used to find this field 
	 * 	valid = true if field is valid, false otherwise 
	 *	message = message related to validation
	 */
	var _buildResult = function(selector,valid,message,messageArgs){
		// get the name of the element from the label
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
	 * Validate a field for being less than a given length.
	 *
	 * results = results from validations already run
	 * $element = element to run validation on
	 * args = a list where the first value is the max number of characters allowed
	 *
	 * returns true if length is less than given max, false otherwise
	 */
	var _validateLength = function(results, $element, args){
		if($element.val().length < args[0]) return true;
		return false;
	};

	/**
	 * Validate a given list of validations.
	 *
	 * validations = a list of validations to run
	 * 
	 * returns a list of objects in this format:
	 * 	{
	 * 	validated field name which is the html in a field's label (string),
	 *	is the field valid (boolean),
	 *	validation message related to if the field is valid (string)
	 *	}
	 */
	var _validate = function(validations){
		// list of results to return
		var results = [];

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
			} 

			// get validation object
			var vinput = new _buildInput(v.select,func.name,v.validMessage,v.invalidMessage);					
			// run validations on each element
			var jlen = vinput.elements.length;
			for(var j = 0;j < jlen;j++){
				var $ele = $(vinput.elements[j]);
				var eleId = '#' + $ele.prop('id');
				var valid = false;

				if(func && jsvalid[func.name]){
					// run api defined
					valid = jsvalid[func.name](results,$ele,func.args);
				} else {
					// run user defined validation
					valid = vinput.validate(results,$ele);
				}

				// create validation object based on validation result
				var args = func ? func.args : null;
				if(valid) result = new _buildResult(eleId,true,vinput.validMessage,args);
				else result = new _buildResult(eleId,false,vinput.invalidMessage,args);

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
				length: '{0} is less than {1} characters!'
			},
			invalid: {
				required: '{0} is required!',
				length: '{0} must be less than {1} characters!'
			}
		},
		validate: _validate,
		required: _validateRequired,
		length: _validateLength
	};
})($);
