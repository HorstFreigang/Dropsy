/**
 * Dropsy Version 0.9.2.1
 *
 * Author: Horst Freigang
 * Web: http://horstfreigang.de
 *
 */

;(function($, window, document, undefined) {
	var pluginName = 'dropsy',
		defaults = {
			type: 'single',				// single or multiple selection
			checkDisabled: false		// checks for occurance of the disabled property
		};
		
	function Dropsy(element, options, index) {
		this.elm = element;
		this.options = $.extend({}, defaults, options);
		this.index = index;
		this.init();
	}
	
	Dropsy.prototype.init = function() {
		if(typeof $(this.elm).data('no-dropsy') === 'undefined') {
			// create the template
			createTemplate(this.index, this.elm, this.options);

			// create the list
			createList(this.index, this.elm, this.options);

			// set the events
			setEvents(this.index, this.elm, this.options);
		}
	};

	// === create tempate function ===
	function createTemplate(index, _select, options) {
		var template = '';

		if(options.type == 'single') {
			template = ''+
			'<div id="dropsy-wrap-'+index+'" class="dropsy-wrap">'+
				'<div class="dropsy-hide-me"></div>'+
				'<div class="dropsy-select">'+
					'<div class="dropsy-label"><span class="dropsy-label-text"></span><i class="dropsy-label-arrow"></i></div>'+
					'<div class="dropsy-list-wrap">'+
						'<ul class="dropsy-list"></ul>'+
					'</div>'+
				'</div>'+
			'</div>';
		}
		
		// append template after current SELECT
		$(_select).after(template);
		
		var _dropsy = $('#dropsy-wrap-'+index);
		
		_dropsy.data('type', options.type);
		_dropsy.data('checkDisabled', options.checkDisabled);
		
		// move current SELECT in template
		_dropsy.find('.dropsy-hide-me').append($(_select));
		
		// update label text
		_dropsy.find('.dropsy-label').find('span').text();

		// add properties from select to dropsy
		if($(_select).prop('disabled') == true) {
			_dropsy.addClass('dropsy-disabled');
		}

		$(_select)
			.data('index', index)
			.data('options', options);
	}


	// === create list function ===
	function createList(index, _select, options) {
		var _dropsy = $('#dropsy-wrap-'+index);

		_dropsy.data('open', false);
		
		$(_select).find('option').each(function() {
			if($(this).prop('selected') == true) {
				var listItem = '<li data-value="'+$(this).val()+'" class="selected">'+$(this).text()+'</li>';
			} else {
				var listItem = '<li data-value="'+$(this).val()+'">'+$(this).text()+'</li>';
			}
			_dropsy.find('.dropsy-list').append(listItem);
		});
		
		_dropsy.find('.dropsy-label').find('.dropsy-label-text').text(_dropsy.find('li.selected').text());
	}


	// === close list ===
	function closeList(options) {
		$('.dropsy-wrap').each(function() {
			$(this).removeClass('dropsy-open');
			$(this).data('open', false);
		});
	}


	// === open list ===
	function openList(_dropsy) {
		_dropsy.addClass('dropsy-open');
		_dropsy.data('open', true);
	}


	// === set events function ===
	function updateValue(_dropsy, elm) {
		var value = $(elm).attr('data-value');

		_dropsy.find('option').each(function() {
			// set property of OPTION to none
			$(this).prop('selected', '');

			if($(this).val() == value) {
				// set value of SELECT to value of clicked LI
				$(this).parent().val(value);

				// set property of OPTION with same value as clicked LI to "selected"
				$(this).prop('selected', 'selected');
			}
		});
	}

	// === adds or removes disabled class ===
	function disableDropsy(_select, _dropsy) {
		if($(_select).prop('disabled') == true) {
			_dropsy.addClass('dropsy-disabled');
		} else {
			_dropsy.removeClass('dropsy-disabled');
		}
	}

	// === set events function ===
	function setEvents(index, _select, options) {
		var _dropsy = $('#dropsy-wrap-'+index);
		var _list = _dropsy.find('.dropsy-list-wrap');

		// show dropdown
		_dropsy.on('click', '.dropsy-label', function() {
			if(_dropsy.hasClass('dropsy-disabled') == false) {
				if(_dropsy.hasClass('dropsy-open') == true) {
					closeList(options);
				} else {
					closeList(options);
					openList(_dropsy);
				}
			}
		});

		// close all selects when clicked on document
		$(document).on('click', function(e) {
			if(!$(e.target).closest('.dropsy-wrap').length) {
				closeList(options);
			}
		});

		// options event
		_dropsy.on('click', 'li', function(e) {
			e.preventDefault();
			updateValue(_dropsy, $(this));
			updateDropsy(_select, _dropsy);
			sendOnChangeEvent(_select);
			closeList(options);
		});
		
		// update dropsy on select value change
		_dropsy.on('change', 'select', function(e) {
			updateDropsy(_select, _dropsy);
		});

		// update dropsy on select markup change
		checkForDOMChange(_select);

		function checkForDOMChange(target) {
			var config = {attributes: false, childList: true, subtree: true};
			var observer = new MutationObserver(observerCallback);
			observer.observe(target, config);
		}

		function observerCallback(mutationList) {
			if(mutationList.length > 0) {
				$(_dropsy).find('li').remove();
				createList($(_select).data('index'), _select, $(_select).data('options'));
			}
		}

		// checkDisabled
		if(_dropsy.data('checkDisabled') == true) {
			setInterval(disableDropsy.bind(null,_select, _dropsy), 1000);
		}
	}

	// === update dropsy function ===
	function updateDropsy(_select, _dropsy) {
		// get value of SELECT
		var value = $(_select).val();
		
		// get text of selected OPTION
		var text = $(_select).find('option:selected').text();

		// remove and add selected-class from/to LIs
		_dropsy.find('li').each(function() {
			$(this).removeClass('selected');

			if($(this).attr('data-value') == value) {
				$(this).addClass('selected');
			}
		});
		
		// fill dropsy label width current value
		_dropsy.find('.dropsy-label').find('.dropsy-label-text').text(text);

		disableDropsy(_select, _dropsy);
	}

	// === send onchange event ===
	function sendOnChangeEvent(_select) {
		$(_select).trigger('change');
	}
	
	$.fn[pluginName] = function(options) {
		return this.each(function(index) {
			if(!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Dropsy(this, options, index));
			}
		});
	}
})(jQuery, window, document);