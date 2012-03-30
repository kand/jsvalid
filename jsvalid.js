/*
 * Library to validate form elements.
 */
var jsvalid = (function($){
	
	/**
	 * An object representing a validation input. Has the following properties:
	 * 	select = selector to run validation on
	 *	validate = function to use for validation on each element in selection
	 * 	validMessage = message to return if validate returns true
	 *	invalidMessage = message to return if validate returns false
	 */
	var _ValidationInput = function(select,validate,validMessage,invalidMessage){
		return {
			select: select,
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
	var _ValidationResult = function(name,selector,valid,message){
		var REPLACE_REGEX = /\{0\}/;
	
		// make sure valid is a boolean value
		valid = valid ? true : false;
		// replace regex matches in messsage with field name
		message = message.replace(REPLACE_REGEX,name);

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
		var trimmedVal = $.trim($ele.val());
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
		var len = validations.length;
		for(var i = 0;i < len;i++){
		}
	};

	return {
		validate: _validate,
		required: _validateRequired
	};
})($);
