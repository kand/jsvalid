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
		} else if(typeof(validate) === 'string' && jsvalid.messages.invalid[validate]){
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
	var _buildResult = function(selector,valid,message){
		var REPLACE_REGEX = /\{0\}/;
		
		// get the name of the element from the label
		var eleId = $(selector).prop('id');
		var $label = $('label[for="' + eleId + '"]');
		var name = $label.html();	
		// make sure valid is a boolean value
		valid = valid ? true : false;
		// replace regex matches in messsage with field name
		if(message) message = message.replace(REPLACE_REGEX,name);

		return {
			name: name,
			selector: selector,
			valid: valid,
			message: message
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
	var _validateRequired = function(results, $element){
		var trimmedVal = $.trim($element.val());
		if(trimmedVal.length > 0){
			return true;
		}
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
			// get validation object
			var v = validations[i];
			var vinput = new _buildInput(v.select,v.validate,v.validMessage,v.invalidMessage);					
			// run validations on each element
			var jlen = vinput.elements.length;
			for(var j = 0;j < jlen;j++){
				var $ele = $(vinput.elements[j]);
				var eleId = '#' + $ele.prop('id');
				var valid = false;
				// check if validation is a string referring to a function in jsvalid
				if(typeof(vinput.validate) === 'string' && jsvalid[vinput.validate]){
					// run api defined
					valid = jsvalid[vinput.validate](results,$ele);
				} else {
					// run user defined validation
					valid = vinput.validate(results,$ele);
				}
				// create validation object based on validation result
				if(valid) result = new _buildResult(eleId,true,vinput.validMessage);
				else result = new _buildResult(eleId,false,vinput.invalidMessage); 
				// add result to results list
				results.push(result);
			}

		}

		return results;
	};

	return {
		messages: {
			valid: {},
			invalid: {
				required: '{0} is required!'
			}
		},
		validate: _validate,
		required: _validateRequired
	};
})($);
